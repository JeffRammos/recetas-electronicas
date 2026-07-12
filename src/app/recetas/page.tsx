import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cerrarSesion } from "@/app/actions/auth";
import { reintentarPendientes } from "@/lib/proveedor/publicar";
import { estadoRecetaDisplay } from "@/lib/receta-estado";
import { AppHeader } from "@/components/app-header";
import { EstadoBadge } from "@/components/estado-badge";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/recetas", label: "Mis recetas" },
  { href: "/perfil", label: "Mi perfil" },
];

export default async function RecetasPage() {
  const sesion = await auth();
  if (!sesion) return null; // protegido por proxy.ts

  const profesional = await prisma.profesional.findUniqueOrThrow({
    where: { usuarioId: sesion.user.id },
  });

  // Sincronización oportunista: cada visita a esta página reintenta las
  // recetas propias que hayan quedado pendientes de publicar.
  await reintentarPendientes(profesional.id);

  const recetas = await prisma.receta.findMany({
    where: { profesionalId: profesional.id },
    include: { paciente: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <AppHeader links={NAV} cerrarSesionAction={cerrarSesion} />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-heading text-2xl text-foreground">Mis recetas</h1>
          <Button nativeButton={false} render={<Link href="/recetas/nueva" />}>
            <FilePlus2 />
            Nueva receta
          </Button>
        </div>

        {recetas.length === 0 && (
          <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            Todavía no emitiste ninguna receta.
          </p>
        )}

        <div className="flex flex-col gap-2">
          {recetas.map((receta) => {
            const { tono, texto } = estadoRecetaDisplay(receta);

            return (
              <Link
                key={receta.id}
                href={`/recetas/${receta.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
              >
                <div>
                  <p className="text-foreground">
                    <span className="font-mono text-sm text-muted-foreground">
                      N° {receta.numero}
                    </span>{" "}
                    — {receta.paciente.apellido}, {receta.paciente.nombre}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {receta.tipo === "MEDICAMENTO" ? "Medicamento" : "Estudio"} · Emitida{" "}
                    <span className="font-mono">
                      {receta.fechaEmision.toLocaleDateString("es-AR")}
                    </span>{" "}
                    · Vence{" "}
                    <span className="font-mono">
                      {receta.fechaVencimiento.toLocaleDateString("es-AR")}
                    </span>
                  </p>
                </div>
                <EstadoBadge tono={tono}>{texto}</EstadoBadge>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
