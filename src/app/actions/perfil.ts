"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PerfilSchema } from "@/lib/validaciones";

export type PerfilFormState =
  | {
      errors?: {
        especialidad?: string[];
        matricula?: string[];
      };
      message?: string;
    }
  | undefined;

const TIPOS_IMAGEN_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];
const TAMANO_MAXIMO_FIRMA = 5 * 1024 * 1024; // 5MB

export async function actualizarPerfil(
  _state: PerfilFormState,
  formData: FormData
): Promise<PerfilFormState> {
  const sesion = await auth();
  if (!sesion || sesion.user.rol !== "PROFESIONAL") {
    return { message: "No tenés permiso para hacer esto." };
  }

  const validado = PerfilSchema.safeParse({
    especialidad: formData.get("especialidad"),
    matricula: formData.get("matricula"),
  });

  if (!validado.success) {
    return { errors: validado.error.flatten().fieldErrors };
  }

  const firma = formData.get("firma");
  let firmaPath: string | undefined;

  if (firma instanceof File && firma.size > 0) {
    if (!TIPOS_IMAGEN_PERMITIDOS.includes(firma.type)) {
      return { message: "La firma debe ser una imagen PNG, JPG o WEBP." };
    }
    if (firma.size > TAMANO_MAXIMO_FIRMA) {
      return { message: "La imagen de la firma no puede superar los 5MB." };
    }

    const blob = await put(`firmas/${sesion.user.id}-${firma.name}`, firma, {
      access: "private",
      addRandomSuffix: true,
    });
    firmaPath = blob.pathname;
  }

  const { especialidad, matricula } = validado.data;

  await prisma.profesional.update({
    where: { usuarioId: sesion.user.id },
    data: {
      especialidad: especialidad || undefined,
      matricula: matricula || undefined,
      ...(firmaPath ? { firmaPath } : {}),
    },
  });

  revalidatePath("/perfil");
  return { message: "Perfil actualizado." };
}
