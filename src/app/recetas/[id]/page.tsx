import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { anularReceta } from "@/app/actions/recetas";

export default async function RecetaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const sesion = await auth();
  if (!sesion) return null; // protegido por proxy.ts

  const { id } = await params;

  const profesional = await prisma.profesional.findUniqueOrThrow({
    where: { usuarioId: sesion.user.id },
  });

  const receta = await prisma.receta.findFirst({
    where: { id, profesionalId: profesional.id },
    include: { paciente: { include: { obraSocial: true } }, items: true },
  });
  if (!receta) notFound();

  const vencida = receta.estado === "EMITIDA" && receta.fechaVencimiento < new Date();

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-zinc-50 px-4 py-12 font-sans dark:bg-black">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Receta N° {receta.numero}</h1>
        <Link href="/recetas" className="text-sm underline text-zinc-600 dark:text-zinc-400">
          Volver
        </Link>
      </div>

      <div className="flex w-full max-w-2xl flex-col gap-4 rounded border border-zinc-300 p-4 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <p className="text-black dark:text-zinc-50">
            {receta.paciente.apellido}, {receta.paciente.nombre} — DNI {receta.paciente.dni}
          </p>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {receta.estado === "ANULADA" ? "Anulada" : vencida ? "Vencida" : "Emitida"}
          </span>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Obra social: {receta.paciente.obraSocial?.nombre ?? "Particular"}
        </p>

        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-black dark:text-zinc-50">
            {receta.tipo === "MEDICAMENTO" ? "Medicamentos" : "Estudio"}
          </p>
          {receta.items.map((item) => (
            <p key={item.id} className="text-sm text-zinc-700 dark:text-zinc-300">
              {item.nombreSnapshot}
              {item.dosis ? ` · ${item.dosis}` : ""}
              {item.frecuencia ? ` · ${item.frecuencia}` : ""}
              {item.cantidad ? ` · Cant. ${item.cantidad}` : ""}
              {item.viaAdministracion ? ` · ${item.viaAdministracion}` : ""}
            </p>
          ))}
        </div>

        {receta.diagnostico && (
          <p className="text-sm text-zinc-700 dark:text-zinc-300">Diagnóstico: {receta.diagnostico}</p>
        )}
        {receta.indicaciones && (
          <p className="text-sm text-zinc-700 dark:text-zinc-300">Indicaciones: {receta.indicaciones}</p>
        )}

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Emitida {receta.fechaEmision.toLocaleDateString("es-AR")} · Vence{" "}
          {receta.fechaVencimiento.toLocaleDateString("es-AR")}
        </p>

        {receta.estado === "ANULADA" && receta.motivoAnulacion && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Motivo de anulación: {receta.motivoAnulacion}
          </p>
        )}

        <div className="flex items-center gap-4">
          {receta.pdfPath && (
            <a
              href={`/api/recetas/${receta.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="w-fit rounded bg-black px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black"
            >
              Ver PDF
            </a>
          )}

          {receta.estado === "EMITIDA" && (
            <form action={anularReceta.bind(null, receta.id)} className="flex items-center gap-2">
              <input
                name="motivo"
                placeholder="Motivo (opcional)"
                className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <button type="submit" className="text-sm underline text-red-600">
                Anular
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
