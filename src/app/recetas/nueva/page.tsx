import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cerrarSesion } from "@/app/actions/auth";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { RecetaForm } from "../_components/receta-form";

const NAV = [
  { href: "/recetas", label: "Mis recetas" },
  { href: "/perfil", label: "Mi perfil" },
];

export default async function NuevaRecetaPage() {
  const sesion = await auth();
  if (!sesion) return null; // protegido por proxy.ts

  const profesional = await prisma.profesional.findUniqueOrThrow({
    where: { usuarioId: sesion.user.id },
  });

  const puedeEmitir = profesional.estado === "APROBADO" && !!profesional.matricula && !!profesional.firmaPath;

  if (!puedeEmitir) {
    return (
      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader links={NAV} cerrarSesionAction={cerrarSesion} />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="font-heading text-2xl text-foreground">
            Todavía no podés emitir recetas
          </h1>
          <p className="text-muted-foreground">
            {profesional.estado !== "APROBADO"
              ? "Tu cuenta todavía no fue aprobada por el admin."
              : "Completá tu matrícula y subí tu firma en tu perfil antes de emitir."}
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/perfil" />}>
            Ir a mi perfil
          </Button>
        </main>
      </div>
    );
  }

  const [pacientes, medicamentos, estudios, obrasSociales] = await Promise.all([
    prisma.paciente.findMany({
      where: { profesionalId: profesional.id },
      orderBy: { apellido: "asc" },
      select: { id: true, nombre: true, apellido: true, dni: true },
    }),
    prisma.medicamento.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.estudio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.obraSocial.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <AppHeader links={NAV} cerrarSesionAction={cerrarSesion} />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <h1 className="font-heading text-2xl text-foreground">Nueva receta</h1>
        <RecetaForm
          pacientes={pacientes}
          medicamentos={medicamentos}
          estudios={estudios}
          obrasSociales={obrasSociales}
        />
      </main>
    </div>
  );
}
