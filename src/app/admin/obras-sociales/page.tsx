import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toggleObraSocialActivo } from "@/app/actions/admin";
import { AdminNav } from "../admin-nav";
import { ObraSocialForm } from "../_components/obra-social-form";
import { EstadoBadge } from "@/components/estado-badge";
import { Button } from "@/components/ui/button";

export default async function ObrasSocialesPage() {
  const sesion = await auth();
  if (!sesion) return null; // protegido por proxy.ts

  const obrasSociales = await prisma.obraSocial.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <AdminNav />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <h1 className="font-heading text-2xl text-foreground">Obras sociales</h1>

        <ObraSocialForm />

        <div className="flex flex-col gap-2">
          {obrasSociales.length === 0 && (
            <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              No hay obras sociales cargadas.
            </p>
          )}
          {obrasSociales.map((obraSocial) => (
            <div
              key={obraSocial.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <p className="text-foreground">{obraSocial.nombre}</p>
                <span className="font-mono text-sm text-muted-foreground">
                  Med. {obraSocial.vencimientoMedicamentosDias ?? "default"} · Est.{" "}
                  {obraSocial.vencimientoEstudiosDias ?? "default"}
                </span>
                <EstadoBadge tono={obraSocial.activo ? "success" : "muted"}>
                  {obraSocial.activo ? "Activa" : "Inactiva"}
                </EstadoBadge>
              </div>
              <form action={toggleObraSocialActivo.bind(null, obraSocial.id, obraSocial.activo)}>
                <Button type="submit" variant="ghost" size="sm">
                  {obraSocial.activo ? "Desactivar" : "Activar"}
                </Button>
              </form>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
