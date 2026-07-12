"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { RegistroSchema } from "@/lib/validaciones";

export type FormState =
  | {
      errors?: {
        nombre?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export async function registrar(_state: FormState, formData: FormData): Promise<FormState> {
  const validado = RegistroSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validado.success) {
    return { errors: validado.error.flatten().fieldErrors };
  }

  const { nombre, email, password } = validado.data;

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return { message: "Ya existe una cuenta registrada con ese email." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.usuario.create({
    data: {
      nombre,
      email,
      passwordHash,
      rol: "PROFESIONAL",
      profesional: { create: {} },
    },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/perfil" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "La cuenta se creó, pero no se pudo iniciar sesión. Probá desde /login." };
    }
    throw error;
  }
}

export async function iniciarSesion(_state: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { message: "Completá email y contraseña." };
  }

  // Se resuelve el rol antes de loguear para poder redirigir directo al home
  // correcto: leer la sesión con auth() inmediatamente después de signIn() no
  // funciona, porque la cookie recién seteada no es visible en el mismo request.
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: usuario?.rol === "ADMIN" ? "/admin" : "/perfil",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Email o contraseña incorrectos." };
    }
    throw error;
  }
}

export async function cerrarSesion() {
  await signOut({ redirectTo: "/login" });
}
