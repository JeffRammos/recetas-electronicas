import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cerrarSesion } from "@/app/actions/auth";
import { PerfilForm } from "./perfil-form";

export default async function PerfilPage() {
  const sesion = await auth();
  if (!sesion) return null; // protegido por proxy.ts

  const profesional = await prisma.profesional.findUniqueOrThrow({
    where: { usuarioId: sesion.user.id },
  });

  const badge =
    profesional.estado === "APROBADO"
      ? { texto: "Aprobado", clase: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" }
      : { texto: "Pendiente de aprobación", clase: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" };

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-zinc-50 px-4 py-12 font-sans dark:bg-black">
      <div className="flex w-full max-w-sm items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Mi perfil</h1>
        <div className="flex items-center gap-4">
          <Link href="/recetas" className="text-sm underline text-zinc-600 dark:text-zinc-400">
            Mis recetas
          </Link>
          <form action={cerrarSesion}>
            <button type="submit" className="text-sm underline text-zinc-600 dark:text-zinc-400">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      <span className={`w-fit rounded-full px-3 py-1 text-sm ${badge.clase}`}>{badge.texto}</span>

      <PerfilForm especialidad={profesional.especialidad} matricula={profesional.matricula} />

      {profesional.firmaPath && (
        <div className="flex w-full max-w-sm flex-col gap-1">
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Firma actual</span>
          <Image
            src={`/api/firma/${profesional.firmaPath}`}
            alt="Firma escaneada"
            width={200}
            height={100}
            className="rounded border border-zinc-300 bg-white object-contain dark:border-zinc-700"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
