import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { crearMedicamento, toggleMedicamentoActivo } from "@/app/actions/admin";
import { AdminNav } from "../admin-nav";
import { CatalogoSimpleForm } from "../_components/catalogo-simple-form";
import { EstadoBadge } from "@/components/estado-badge";
import { Button } from "@/components/ui/button";

export default async function MedicamentosPage() {
  const sesion = await auth();
  if (!sesion) return null; // protegido por proxy.ts

  const medicamentos = await prisma.medicamento.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <AdminNav />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <h1 className="font-heading text-2xl text-foreground">Medicamentos</h1>

        <CatalogoSimpleForm action={crearMedicamento} vencimientoPorDefecto={30} />

        <div className="flex flex-col gap-2">
          {medicamentos.length === 0 && (
            <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              No hay medicamentos cargados.
            </p>
          )}
          {medicamentos.map((medicamento) => (
            <div
              key={medicamento.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <p className="text-foreground">{medicamento.nombre}</p>
                <span className="font-mono text-sm text-muted-foreground">
                  {medicamento.vencimientoDias}d
                </span>
                <EstadoBadge tono={medicamento.activo ? "success" : "muted"}>
                  {medicamento.activo ? "Activo" : "Inactivo"}
                </EstadoBadge>
              </div>
              <form action={toggleMedicamentoActivo.bind(null, medicamento.id, medicamento.activo)}>
                <Button type="submit" variant="ghost" size="sm">
                  {medicamento.activo ? "Desactivar" : "Activar"}
                </Button>
              </form>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
