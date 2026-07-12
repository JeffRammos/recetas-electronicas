import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { crearEstudio, toggleEstudioActivo } from "@/app/actions/admin";
import { AdminNav } from "../admin-nav";
import { CatalogoSimpleForm } from "../_components/catalogo-simple-form";
import { EstadoBadge } from "@/components/estado-badge";
import { Button } from "@/components/ui/button";

export default async function EstudiosPage() {
  const sesion = await auth();
  if (!sesion) return null; // protegido por proxy.ts

  const estudios = await prisma.estudio.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <AdminNav />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <h1 className="font-heading text-2xl text-foreground">Estudios</h1>

        <CatalogoSimpleForm action={crearEstudio} vencimientoPorDefecto={60} />

        <div className="flex flex-col gap-2">
          {estudios.length === 0 && (
            <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              No hay estudios cargados.
            </p>
          )}
          {estudios.map((estudio) => (
            <div
              key={estudio.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <p className="text-foreground">{estudio.nombre}</p>
                <span className="font-mono text-sm text-muted-foreground">
                  {estudio.vencimientoDias}d
                </span>
                <EstadoBadge tono={estudio.activo ? "success" : "muted"}>
                  {estudio.activo ? "Activo" : "Inactivo"}
                </EstadoBadge>
              </div>
              <form action={toggleEstudioActivo.bind(null, estudio.id, estudio.activo)}>
                <Button type="submit" variant="ghost" size="sm">
                  {estudio.activo ? "Desactivar" : "Activar"}
                </Button>
              </form>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
