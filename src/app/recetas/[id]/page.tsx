import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cerrarSesion } from "@/app/actions/auth";
import { anularReceta, reintentarSincronizacion, simularDispensacion } from "@/app/actions/recetas";
import { estadoRecetaDisplay } from "@/lib/receta-estado";
import { AppHeader } from "@/components/app-header";
import { EstadoBadge } from "@/components/estado-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const NAV = [
  { href: "/recetas", label: "Mis recetas" },
  { href: "/perfil", label: "Mi perfil" },
];

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

  const { tono, texto } = estadoRecetaDisplay(receta);

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <AppHeader links={NAV} cerrarSesionAction={cerrarSesion} />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl text-foreground">
            Receta <span className="font-mono text-2xl">N° {receta.numero}</span>
          </h1>
          <EstadoBadge tono={tono}>{texto}</EstadoBadge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{receta.paciente.apellido}, {receta.paciente.nombre}</CardTitle>
            <p className="text-sm text-muted-foreground">
              DNI <span className="font-mono">{receta.paciente.dni}</span> · Obra social:{" "}
              {receta.paciente.obraSocial?.nombre ?? "Particular"}
            </p>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">
                {receta.tipo === "MEDICAMENTO" ? "Medicamentos" : "Estudio"}
              </p>
              <div className="flex flex-col gap-1">
                {receta.items.map((item) => (
                  <p key={item.id} className="text-sm text-muted-foreground">
                    <span className="text-foreground">{item.nombreSnapshot}</span>
                    {item.dosis ? ` · ${item.dosis}` : ""}
                    {item.frecuencia ? ` · ${item.frecuencia}` : ""}
                    {item.cantidad ? ` · Cant. ${item.cantidad}` : ""}
                    {item.viaAdministracion ? ` · ${item.viaAdministracion}` : ""}
                  </p>
                ))}
              </div>
            </div>

            {(receta.diagnostico || receta.indicaciones) && (
              <>
                <Separator />
                <div className="flex flex-col gap-1 text-sm">
                  {receta.diagnostico && (
                    <p>
                      <span className="text-muted-foreground">Diagnóstico: </span>
                      {receta.diagnostico}
                    </p>
                  )}
                  {receta.indicaciones && (
                    <p>
                      <span className="text-muted-foreground">Indicaciones: </span>
                      {receta.indicaciones}
                    </p>
                  )}
                </div>
              </>
            )}

            <Separator />

            <p className="font-mono text-sm text-muted-foreground">
              Emitida {receta.fechaEmision.toLocaleDateString("es-AR")} · Vence{" "}
              {receta.fechaVencimiento.toLocaleDateString("es-AR")}
            </p>

            {receta.estado === "ANULADA" && receta.motivoAnulacion && (
              <p className="text-sm text-muted-foreground">
                Motivo de anulación: {receta.motivoAnulacion}
              </p>
            )}

            {receta.estado === "PENDIENTE_SYNC" && (
              <p className="text-sm text-warning">
                Todavía no se pudo publicar en el proveedor. El PDF ya está listo, pero la
                receta va a quedar pendiente hasta que se sincronice.
              </p>
            )}

            {receta.proveedorExternalId && (
              <p className="font-mono text-xs text-muted-foreground">
                ID proveedor: {receta.proveedorExternalId}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {receta.pdfPath && (
                <Button variant="secondary" nativeButton={false} render={
                  <a href={`/api/recetas/${receta.id}/pdf`} target="_blank" rel="noreferrer" />
                }>
                  <FileText />
                  Ver PDF
                </Button>
              )}

              {receta.estado === "PENDIENTE_SYNC" && (
                <form action={reintentarSincronizacion.bind(null, receta.id)}>
                  <Button type="submit" variant="outline" size="sm">
                    Reintentar ahora
                  </Button>
                </form>
              )}

              {receta.estado === "EMITIDA" && (
                <form action={simularDispensacion.bind(null, receta.id)}>
                  <Button type="submit" variant="outline" size="sm">
                    (demo) Simular dispensación
                  </Button>
                </form>
              )}

              {(receta.estado === "EMITIDA" || receta.estado === "PENDIENTE_SYNC") && (
                <form action={anularReceta.bind(null, receta.id)} className="flex items-center gap-2">
                  <Input
                    name="motivo"
                    placeholder="Motivo (opcional)"
                    className="h-8 w-48"
                  />
                  <Button type="submit" variant="destructive" size="sm">
                    Anular
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
