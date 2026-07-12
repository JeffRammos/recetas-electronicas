import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cerrarSesion } from "@/app/actions/auth";

export default async function RecetasPage() {
  const sesion = await auth();
  if (!sesion) return null; // protegido por proxy.ts

  const profesional = await prisma.profesional.findUniqueOrThrow({
    where: { usuarioId: sesion.user.id },
  });

  const recetas = await prisma.receta.findMany({
    where: { profesionalId: profesional.id },
    include: { paciente: true },
    orderBy: { createdAt: "desc" },
  });

  const hoy = new Date();

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-zinc-50 px-4 py-12 font-sans dark:bg-black">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Mis recetas</h1>
        <div className="flex items-center gap-4">
          <Link href="/perfil" className="text-sm underline text-zinc-600 dark:text-zinc-400">
            Mi perfil
          </Link>
          <Link
            href="/recetas/nueva"
            className="rounded bg-black px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black"
          >
            Nueva receta
          </Link>
          <form action={cerrarSesion}>
            <button type="submit" className="text-sm underline text-zinc-600 dark:text-zinc-400">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      {recetas.length === 0 && (
        <p className="text-zinc-600 dark:text-zinc-400">Todavía no emitiste ninguna receta.</p>
      )}

      <div className="flex w-full max-w-2xl flex-col gap-2">
        {recetas.map((receta) => {
          const vencida = receta.estado === "EMITIDA" && receta.fechaVencimiento < hoy;
          const estadoTexto = receta.estado === "ANULADA" ? "Anulada" : vencida ? "Vencida" : "Emitida";
          const estadoClase =
            receta.estado === "ANULADA"
              ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              : vencida
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";

          return (
            <Link
              key={receta.id}
              href={`/recetas/${receta.id}`}
              className="flex items-center justify-between rounded border border-zinc-300 p-3 dark:border-zinc-700"
            >
              <div>
                <p className="text-black dark:text-zinc-50">
                  N° {receta.numero} — {receta.paciente.apellido}, {receta.paciente.nombre}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {receta.tipo === "MEDICAMENTO" ? "Medicamento" : "Estudio"} · Emitida{" "}
                  {receta.fechaEmision.toLocaleDateString("es-AR")} · Vence{" "}
                  {receta.fechaVencimiento.toLocaleDateString("es-AR")}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm ${estadoClase}`}>{estadoTexto}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
