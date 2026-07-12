import { auth } from "@/auth";
import { AdminNav } from "./admin-nav";

export default async function AdminPage() {
  const sesion = await auth();
  if (!sesion) return null; // protegido por proxy.ts

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <AdminNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="font-heading text-2xl text-foreground">Panel de administración</h1>
        <p className="text-muted-foreground">
          Elegí una sección arriba: aprobar profesionales o mantener los catálogos de
          medicamentos, estudios y obras sociales.
        </p>
      </main>
    </div>
  );
}
