"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function aprobarProfesional(profesionalId: string) {
  const sesion = await auth();
  if (!sesion || sesion.user.rol !== "ADMIN") {
    throw new Error("No tenés permiso para hacer esto.");
  }

  await prisma.profesional.update({
    where: { id: profesionalId },
    data: { estado: "APROBADO" },
  });

  revalidatePath("/admin");
}
