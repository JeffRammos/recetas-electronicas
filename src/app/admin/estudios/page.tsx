import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { crearEstudio, toggleEstudioActivo } from "@/app/actions/admin";
import { AdminNav } from "../admin-nav";
import { CatalogoSimpleForm } from "../_components/catalogo-simple-form";

export default async function EstudiosPage() {
  const sesion = await auth();
  if (!sesion) return null; // protegido por proxy.ts

  const estudios = await prisma.estudio.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-zinc-50 px-4 py-12 font-sans dark:bg-black">
      <AdminNav />
      <h1 className="w-full max-w-2xl text-2xl font-semibold text-black dark:text-zinc-50">
        Estudios
      </h1>

      <CatalogoSimpleForm action={crearEstudio} vencimientoPorDefecto={60} />

      <div className="flex w-full max-w-2xl flex-col gap-2">
        {estudios.length === 0 && (
          <p className="text-zinc-600 dark:text-zinc-400">No hay estudios cargados.</p>
        )}
        {estudios.map((estudio) => (
          <div
            key={estudio.id}
            className="flex items-center justify-between rounded border border-zinc-300 p-3 dark:border-zinc-700"
          >
            <div>
              <p className="text-black dark:text-zinc-50">{estudio.nombre}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Vence a los {estudio.vencimientoDias} días
                {!estudio.activo && " · Inactivo"}
              </p>
            </div>
            <form action={toggleEstudioActivo.bind(null, estudio.id, estudio.activo)}>
              <button type="submit" className="text-sm underline text-zinc-700 dark:text-zinc-300">
                {estudio.activo ? "Desactivar" : "Activar"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
