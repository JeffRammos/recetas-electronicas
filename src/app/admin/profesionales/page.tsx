import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { aprobarProfesional } from "@/app/actions/admin";
import { AdminNav } from "../admin-nav";

export default async function ProfesionalesPage() {
  const sesion = await auth();
  if (!sesion) return null; // protegido por proxy.ts

  const profesionales = await prisma.profesional.findMany({
    where: { estado: "PENDIENTE" },
    include: { usuario: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-zinc-50 px-4 py-12 font-sans dark:bg-black">
      <AdminNav />

      <div className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Profesionales pendientes de aprobación
        </h1>
      </div>

      {profesionales.length === 0 && (
        <p className="text-zinc-600 dark:text-zinc-400">No hay profesionales pendientes.</p>
      )}

      <div className="flex w-full max-w-2xl flex-col gap-3">
        {profesionales.map((profesional) => (
          <div
            key={profesional.id}
            className="flex flex-col gap-2 rounded border border-zinc-300 p-4 dark:border-zinc-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black dark:text-zinc-50">
                  {profesional.usuario.nombre}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {profesional.usuario.email}
                </p>
              </div>
              <form action={aprobarProfesional.bind(null, profesional.id)}>
                <button
                  type="submit"
                  className="rounded bg-black px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black"
                >
                  Aprobar
                </button>
              </form>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <p>Especialidad: {profesional.especialidad ?? "—"}</p>
              <p>Matrícula: {profesional.matricula ?? "—"}</p>
            </div>

            {profesional.firmaPath ? (
              <a
                href={`/api/firma/${profesional.firmaPath}`}
                target="_blank"
                rel="noreferrer"
                className="w-fit text-sm underline text-zinc-700 dark:text-zinc-300"
              >
                Ver firma escaneada
              </a>
            ) : (
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Perfil incompleto: falta la firma.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
