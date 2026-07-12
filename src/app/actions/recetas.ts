"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generarRecetaPdf } from "@/lib/receta-pdf";
import { intentarPublicar } from "@/lib/proveedor/publicar";
import { firmarPayload } from "@/lib/proveedor/firma";
import { PacienteSchema, RecetaItemSchema, RecetaSchema } from "@/lib/validaciones";

function urlBase() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export type RecetaFormState =
  | {
      errors?: Record<string, string[] | undefined>;
      message?: string;
    }
  | undefined;

const MAX_ITEMS_MEDICAMENTO = 3;

export async function emitirReceta(
  _state: RecetaFormState,
  formData: FormData
): Promise<RecetaFormState> {
  const sesion = await auth();
  if (!sesion || sesion.user.rol !== "PROFESIONAL") {
    return { message: "No tenés permiso para hacer esto." };
  }

  const profesional = await prisma.profesional.findUniqueOrThrow({
    where: { usuarioId: sesion.user.id },
    include: { usuario: true },
  });

  if (profesional.estado !== "APROBADO") {
    return { message: "Tu cuenta todavía no fue aprobada por el admin." };
  }
  if (!profesional.matricula || !profesional.firmaPath) {
    return { message: "Completá tu matrícula y firma en tu perfil antes de emitir." };
  }

  const recetaValidada = RecetaSchema.safeParse({
    tipo: formData.get("tipo"),
    pacienteId: formData.get("pacienteId"),
    diagnostico: formData.get("diagnostico"),
    indicaciones: formData.get("indicaciones"),
  });
  if (!recetaValidada.success) {
    return { errors: recetaValidada.error.flatten().fieldErrors };
  }
  const { tipo, pacienteId, diagnostico, indicaciones } = recetaValidada.data;

  // Paciente: existente (del mismo profesional) o alta inline de uno nuevo.
  let paciente;
  if (pacienteId) {
    paciente = await prisma.paciente.findFirst({
      where: { id: pacienteId, profesionalId: profesional.id },
      include: { obraSocial: true },
    });
    if (!paciente) {
      return { message: "El paciente seleccionado no es válido." };
    }
  } else {
    const pacienteValidado = PacienteSchema.safeParse({
      dni: formData.get("dni"),
      nombre: formData.get("nombrePaciente"),
      apellido: formData.get("apellidoPaciente"),
      fechaNacimiento: formData.get("fechaNacimiento"),
      sexo: formData.get("sexo"),
      obraSocialId: formData.get("obraSocialId"),
      obraSocialCredencial: formData.get("obraSocialCredencial"),
    });
    if (!pacienteValidado.success) {
      return { errors: pacienteValidado.error.flatten().fieldErrors };
    }
    const datosPaciente = pacienteValidado.data;
    const obraSocialId =
      datosPaciente.obraSocialId && datosPaciente.obraSocialId !== "particular"
        ? datosPaciente.obraSocialId
        : undefined;
    paciente = await prisma.paciente.upsert({
      where: { profesionalId_dni: { profesionalId: profesional.id, dni: datosPaciente.dni } },
      update: {},
      create: {
        profesionalId: profesional.id,
        dni: datosPaciente.dni,
        nombre: datosPaciente.nombre,
        apellido: datosPaciente.apellido,
        fechaNacimiento: datosPaciente.fechaNacimiento,
        sexo: datosPaciente.sexo,
        obraSocialId,
        obraSocialCredencial: datosPaciente.obraSocialCredencial || undefined,
      },
      include: { obraSocial: true },
    });
  }

  const maxItems = tipo === "MEDICAMENTO" ? MAX_ITEMS_MEDICAMENTO : 1;
  const itemsCrudos: unknown[] = [];
  for (let i = 1; i <= MAX_ITEMS_MEDICAMENTO; i++) {
    const catalogoId = formData.get(`item${i}_catalogoId`);
    if (!catalogoId) continue;
    if (i > maxItems) {
      return { message: `Una receta de este tipo admite como máximo ${maxItems} ítem(s).` };
    }
    itemsCrudos.push({
      catalogoId,
      dosis: formData.get(`item${i}_dosis`),
      frecuencia: formData.get(`item${i}_frecuencia`),
      cantidad: formData.get(`item${i}_cantidad`),
      viaAdministracion: formData.get(`item${i}_viaAdministracion`),
    });
  }
  if (itemsCrudos.length === 0) {
    return { message: "Agregá al menos un ítem." };
  }

  const itemsValidados = [];
  for (const crudo of itemsCrudos) {
    const parsed = RecetaItemSchema.safeParse(crudo);
    if (!parsed.success) {
      return { message: "Revisá los ítems cargados." };
    }
    itemsValidados.push(parsed.data);
  }

  const overrideDias =
    tipo === "MEDICAMENTO"
      ? paciente.obraSocial?.vencimientoMedicamentosDias
      : paciente.obraSocial?.vencimientoEstudiosDias;

  type ItemResuelto = {
    medicamentoId: string | null;
    estudioId: string | null;
    nombreSnapshot: string;
    dosis: string | null;
    frecuencia: string | null;
    cantidad: string | null;
    viaAdministracion: string | null;
    vencimientoDiasAplicado: number;
  };
  const itemsResueltos: ItemResuelto[] = [];

  for (const item of itemsValidados) {
    if (tipo === "MEDICAMENTO") {
      const medicamento = await prisma.medicamento.findFirst({
        where: { id: item.catalogoId, activo: true },
      });
      if (!medicamento) {
        return { message: "Uno de los medicamentos elegidos ya no está disponible." };
      }
      itemsResueltos.push({
        medicamentoId: medicamento.id,
        estudioId: null,
        nombreSnapshot: medicamento.nombre,
        dosis: item.dosis || null,
        frecuencia: item.frecuencia || null,
        cantidad: item.cantidad || null,
        viaAdministracion: item.viaAdministracion || null,
        vencimientoDiasAplicado: overrideDias ?? medicamento.vencimientoDias,
      });
    } else {
      const estudio = await prisma.estudio.findFirst({ where: { id: item.catalogoId, activo: true } });
      if (!estudio) {
        return { message: "El estudio elegido ya no está disponible." };
      }
      itemsResueltos.push({
        medicamentoId: null,
        estudioId: estudio.id,
        nombreSnapshot: estudio.nombre,
        dosis: null,
        frecuencia: null,
        cantidad: item.cantidad || null,
        viaAdministracion: null,
        vencimientoDiasAplicado: overrideDias ?? estudio.vencimientoDias,
      });
    }
  }

  const diasMinimo = Math.min(...itemsResueltos.map((i) => i.vencimientoDiasAplicado));
  const fechaEmision = new Date();
  const fechaVencimiento = new Date(fechaEmision.getTime() + diasMinimo * 24 * 60 * 60 * 1000);

  const receta = await prisma.receta.create({
    data: {
      profesionalId: profesional.id,
      pacienteId: paciente.id,
      tipo,
      diagnostico: diagnostico || undefined,
      indicaciones: indicaciones || undefined,
      fechaEmision,
      fechaVencimiento,
      estado: "PENDIENTE_SYNC",
      items: { create: itemsResueltos },
    },
    include: { items: true },
  });

  const pdfBuffer = await generarRecetaPdf(
    {
      numero: receta.numero,
      tipo: receta.tipo,
      fechaEmision: receta.fechaEmision,
      fechaVencimiento: receta.fechaVencimiento,
      diagnostico: receta.diagnostico,
      indicaciones: receta.indicaciones,
      profesional: {
        nombre: profesional.usuario.nombre,
        matricula: profesional.matricula,
        especialidad: profesional.especialidad,
      },
      paciente: {
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        dni: paciente.dni,
        fechaNacimiento: paciente.fechaNacimiento,
        sexo: paciente.sexo,
        obraSocialNombre: paciente.obraSocial?.nombre ?? null,
        obraSocialCredencial: paciente.obraSocialCredencial,
      },
      items: receta.items.map((i) => ({
        nombreSnapshot: i.nombreSnapshot,
        dosis: i.dosis,
        frecuencia: i.frecuencia,
        cantidad: i.cantidad,
        viaAdministracion: i.viaAdministracion,
      })),
    },
    profesional.firmaPath
  );

  const blob = await put(`recetas/${profesional.id}/${receta.id}.pdf`, pdfBuffer, {
    access: "private",
    contentType: "application/pdf",
  });

  await prisma.receta.update({ where: { id: receta.id }, data: { pdfPath: blob.pathname } });

  // Se intenta publicar en el proveedor recién al final: el PDF y el guardado
  // local no dependen de esto. Si el proveedor está caído, la receta queda en
  // PENDIENTE_SYNC (ver Regla 6) en vez de bloquear la emisión.
  await intentarPublicar(receta.id);

  revalidatePath("/recetas");
  redirect(`/recetas/${receta.id}`);
}

export async function anularReceta(recetaId: string, formData: FormData) {
  const sesion = await auth();
  if (!sesion || sesion.user.rol !== "PROFESIONAL") {
    throw new Error("No tenés permiso para hacer esto.");
  }

  const profesional = await prisma.profesional.findUniqueOrThrow({
    where: { usuarioId: sesion.user.id },
  });

  const receta = await prisma.receta.findFirst({
    where: { id: recetaId, profesionalId: profesional.id },
  });
  if (!receta) throw new Error("Receta no encontrada.");
  if (receta.estado !== "EMITIDA" && receta.estado !== "PENDIENTE_SYNC") {
    throw new Error("Esta receta ya no se puede anular.");
  }

  const motivo = formData.get("motivo");

  await prisma.receta.update({
    where: { id: recetaId },
    data: { estado: "ANULADA", motivoAnulacion: typeof motivo === "string" && motivo ? motivo : null },
  });

  revalidatePath("/recetas");
  revalidatePath(`/recetas/${recetaId}`);
}

export async function reintentarSincronizacion(recetaId: string) {
  const sesion = await auth();
  if (!sesion || sesion.user.rol !== "PROFESIONAL") {
    throw new Error("No tenés permiso para hacer esto.");
  }

  const profesional = await prisma.profesional.findUniqueOrThrow({
    where: { usuarioId: sesion.user.id },
  });

  const receta = await prisma.receta.findFirst({
    where: { id: recetaId, profesionalId: profesional.id, estado: "PENDIENTE_SYNC" },
  });
  if (!receta) throw new Error("Receta no encontrada o ya sincronizada.");

  await intentarPublicar(recetaId);

  revalidatePath("/recetas");
  revalidatePath(`/recetas/${recetaId}`);
}

export async function simularDispensacion(recetaId: string) {
  const sesion = await auth();
  if (!sesion || sesion.user.rol !== "PROFESIONAL") {
    throw new Error("No tenés permiso para hacer esto.");
  }

  const profesional = await prisma.profesional.findUniqueOrThrow({
    where: { usuarioId: sesion.user.id },
  });

  const receta = await prisma.receta.findFirst({
    where: { id: recetaId, profesionalId: profesional.id },
  });
  if (!receta || !receta.proveedorExternalId) {
    throw new Error("La receta todavía no fue publicada en el proveedor.");
  }

  const payload = JSON.stringify({
    eventId: crypto.randomUUID(),
    externalId: receta.proveedorExternalId,
    evento: "DISPENSADA",
  });

  await fetch(`${urlBase()}/api/recetas/webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-proveedor-signature": firmarPayload(payload),
    },
    body: payload,
  });

  revalidatePath("/recetas");
  revalidatePath(`/recetas/${recetaId}`);
}
