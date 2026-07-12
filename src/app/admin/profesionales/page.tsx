import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { aprobarProfesional } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="flex min-h-screen flex-1 flex-col">
      <AdminNav />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <h1 className="font-heading text-2xl text-foreground">
          Profesionales pendientes de aprobación
        </h1>

        {profesionales.length === 0 && (
          <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            No hay profesionales pendientes.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {profesionales.map((profesional) => (
            <Card key={profesional.id}>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{profesional.usuario.nombre}</p>
                    <p className="text-sm text-muted-foreground">{profesional.usuario.email}</p>
                  </div>
                  <form action={aprobarProfesional.bind(null, profesional.id)}>
                    <Button type="submit" size="sm">
                      Aprobar
                    </Button>
                  </form>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <p>Especialidad: {profesional.especialidad ?? "—"}</p>
                  <p>Matrícula: {profesional.matricula ?? "—"}</p>
                </div>

                {profesional.firmaPath ? (
                  <a
                    href={`/api/firma/${profesional.firmaPath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-fit text-sm font-medium text-primary hover:underline"
                  >
                    Ver firma escaneada
                  </a>
                ) : (
                  <p className="text-sm text-warning">Perfil incompleto: falta la firma.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
