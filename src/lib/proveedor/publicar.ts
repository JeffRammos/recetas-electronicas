import { prisma } from "@/lib/prisma";
import { proveedor } from "./index";

/**
 * Intenta publicar una receta en el proveedor. Si funciona, la pasa a
 * EMITIDA y guarda el id externo; si el proveedor falla, no hace nada más
 * y la receta queda en PENDIENTE_SYNC para reintentarse después.
 */
export async function intentarPublicar(recetaId: string): Promise<boolean> {
  const receta = await prisma.receta.findUniqueOrThrow({
    where: { id: recetaId },
    include: { profesional: true, paciente: true },
  });

  try {
    const { externalId } = await proveedor.publicarReceta({
      recetaId: receta.id,
      numero: receta.numero,
      tipo: receta.tipo,
      profesionalMatricula: receta.profesional.matricula ?? "",
      pacienteDni: receta.paciente.dni,
    });

    await prisma.receta.update({
      where: { id: recetaId },
      data: { estado: "EMITIDA", proveedorExternalId: externalId },
    });
    return true;
  } catch {
    return false;
  }
}

export async function reintentarPendientes(profesionalId: string): Promise<void> {
  const pendientes = await prisma.receta.findMany({
    where: { profesionalId, estado: "PENDIENTE_SYNC" },
    select: { id: true },
  });

  for (const { id } of pendientes) {
    await intentarPublicar(id);
  }
}
