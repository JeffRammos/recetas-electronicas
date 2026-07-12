import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RecetaForm } from "../_components/receta-form";

export default async function NuevaRecetaPage() {
  const sesion = await auth();
  if (!sesion) return null; // protegido por proxy.ts

  const profesional = await prisma.profesional.findUniqueOrThrow({
    where: { usuarioId: sesion.user.id },
  });

  const puedeEmitir = profesional.estado === "APROBADO" && !!profesional.matricula && !!profesional.firmaPath;

  if (!puedeEmitir) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-center font-sans dark:bg-black">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Todavía no podés emitir recetas</h1>
        <p className="max-w-md text-zinc-600 dark:text-zinc-400">
          {profesional.estado !== "APROBADO"
            ? "Tu cuenta todavía no fue aprobada por el admin."
            : "Completá tu matrícula y subí tu firma en tu perfil antes de emitir."}
        </p>
        <Link href="/perfil" className="underline text-zinc-700 dark:text-zinc-300">
          Ir a mi perfil
        </Link>
      </div>
    );
  }

  const [pacientes, medicamentos, estudios, obrasSociales] = await Promise.all([
    prisma.paciente.findMany({
      where: { profesionalId: profesional.id },
      orderBy: { apellido: "asc" },
      select: { id: true, nombre: true, apellido: true, dni: true },
    }),
    prisma.medicamento.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.estudio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.obraSocial.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-zinc-50 px-4 py-12 font-sans dark:bg-black">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Nueva receta</h1>
        <Link href="/recetas" className="text-sm underline text-zinc-600 dark:text-zinc-400">
          Volver
        </Link>
      </div>
      <RecetaForm
        pacientes={pacientes}
        medicamentos={medicamentos}
        estudios={estudios}
        obrasSociales={obrasSociales}
      />
    </div>
  );
}
