import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toggleObraSocialActivo } from "@/app/actions/admin";
import { AdminNav } from "../admin-nav";
import { ObraSocialForm } from "../_components/obra-social-form";

export default async function ObrasSocialesPage() {
  const sesion = await auth();
  if (!sesion) return null; // protegido por proxy.ts

  const obrasSociales = await prisma.obraSocial.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-zinc-50 px-4 py-12 font-sans dark:bg-black">
      <AdminNav />
      <h1 className="w-full max-w-2xl text-2xl font-semibold text-black dark:text-zinc-50">
        Obras sociales
      </h1>

      <ObraSocialForm />

      <div className="flex w-full max-w-2xl flex-col gap-2">
        {obrasSociales.length === 0 && (
          <p className="text-zinc-600 dark:text-zinc-400">No hay obras sociales cargadas.</p>
        )}
        {obrasSociales.map((obraSocial) => (
          <div
            key={obraSocial.id}
            className="flex items-center justify-between rounded border border-zinc-300 p-3 dark:border-zinc-700"
          >
            <div>
              <p className="text-black dark:text-zinc-50">{obraSocial.nombre}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Medicamentos: {obraSocial.vencimientoMedicamentosDias ?? "default"} · Estudios:{" "}
                {obraSocial.vencimientoEstudiosDias ?? "default"}
                {!obraSocial.activo && " · Inactiva"}
              </p>
            </div>
            <form action={toggleObraSocialActivo.bind(null, obraSocial.id, obraSocial.activo)}>
              <button type="submit" className="text-sm underline text-zinc-700 dark:text-zinc-300">
                {obraSocial.activo ? "Desactivar" : "Activar"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
