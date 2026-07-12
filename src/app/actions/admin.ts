"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CatalogoSimpleSchema, ObraSocialSchema } from "@/lib/validaciones";

export type CatalogoFormState =
  | {
      errors?: {
        nombre?: string[];
        vencimientoDias?: string[];
        vencimientoMedicamentosDias?: string[];
        vencimientoEstudiosDias?: string[];
      };
      message?: string;
    }
  | undefined;

async function requerirAdmin() {
  const sesion = await auth();
  if (!sesion || sesion.user.rol !== "ADMIN") {
    throw new Error("No tenés permiso para hacer esto.");
  }
}

export async function aprobarProfesional(profesionalId: string) {
  await requerirAdmin();

  await prisma.profesional.update({
    where: { id: profesionalId },
    data: { estado: "APROBADO" },
  });

  revalidatePath("/admin/profesionales");
}

export async function crearMedicamento(
  _state: CatalogoFormState,
  formData: FormData
): Promise<CatalogoFormState> {
  await requerirAdmin();

  const validado = CatalogoSimpleSchema.safeParse({
    nombre: formData.get("nombre"),
    vencimientoDias: formData.get("vencimientoDias"),
  });
  if (!validado.success) {
    return { errors: validado.error.flatten().fieldErrors };
  }

  await prisma.medicamento.create({ data: validado.data });
  revalidatePath("/admin/medicamentos");
}

export async function toggleMedicamentoActivo(id: string, activo: boolean) {
  await requerirAdmin();
  await prisma.medicamento.update({ where: { id }, data: { activo: !activo } });
  revalidatePath("/admin/medicamentos");
}

export async function crearEstudio(
  _state: CatalogoFormState,
  formData: FormData
): Promise<CatalogoFormState> {
  await requerirAdmin();

  const validado = CatalogoSimpleSchema.safeParse({
    nombre: formData.get("nombre"),
    vencimientoDias: formData.get("vencimientoDias"),
  });
  if (!validado.success) {
    return { errors: validado.error.flatten().fieldErrors };
  }

  await prisma.estudio.create({ data: validado.data });
  revalidatePath("/admin/estudios");
}

export async function toggleEstudioActivo(id: string, activo: boolean) {
  await requerirAdmin();
  await prisma.estudio.update({ where: { id }, data: { activo: !activo } });
  revalidatePath("/admin/estudios");
}

export async function crearObraSocial(
  _state: CatalogoFormState,
  formData: FormData
): Promise<CatalogoFormState> {
  await requerirAdmin();

  const validado = ObraSocialSchema.safeParse({
    nombre: formData.get("nombre"),
    vencimientoMedicamentosDias: formData.get("vencimientoMedicamentosDias"),
    vencimientoEstudiosDias: formData.get("vencimientoEstudiosDias"),
  });
  if (!validado.success) {
    return { errors: validado.error.flatten().fieldErrors };
  }

  await prisma.obraSocial.create({ data: validado.data });
  revalidatePath("/admin/obras-sociales");
}

export async function toggleObraSocialActivo(id: string, activo: boolean) {
  await requerirAdmin();
  await prisma.obraSocial.update({ where: { id }, data: { activo: !activo } });
  revalidatePath("/admin/obras-sociales");
}
