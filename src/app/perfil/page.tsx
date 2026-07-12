import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cerrarSesion } from "@/app/actions/auth";
import { AppHeader } from "@/components/app-header";
import { EstadoBadge } from "@/components/estado-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PerfilForm } from "./perfil-form";

const NAV = [
  { href: "/recetas", label: "Mis recetas" },
  { href: "/perfil", label: "Mi perfil" },
];

export default async function PerfilPage() {
  const sesion = await auth();
  if (!sesion) return null; // protegido por proxy.ts

  const profesional = await prisma.profesional.findUniqueOrThrow({
    where: { usuarioId: sesion.user.id },
  });

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <AppHeader links={NAV} cerrarSesionAction={cerrarSesion} />

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl text-foreground">Mi perfil</h1>
          <EstadoBadge tono={profesional.estado === "APROBADO" ? "success" : "warning"}>
            {profesional.estado === "APROBADO" ? "Aprobado" : "Pendiente de aprobación"}
          </EstadoBadge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datos profesionales</CardTitle>
          </CardHeader>
          <CardContent>
            <PerfilForm especialidad={profesional.especialidad} matricula={profesional.matricula} />
          </CardContent>
        </Card>

        {profesional.firmaPath && (
          <Card>
            <CardHeader>
              <CardTitle>Firma actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-fit rounded-lg border border-border bg-white p-3">
                <Image
                  src={`/api/firma/${profesional.firmaPath}`}
                  alt="Firma escaneada"
                  width={200}
                  height={100}
                  className="object-contain"
                  unoptimized
                />
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
