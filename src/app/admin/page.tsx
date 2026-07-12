import { auth } from "@/auth";
import { AdminNav } from "./admin-nav";

export default async function AdminPage() {
  const sesion = await auth();
  if (!sesion) return null; // protegido por proxy.ts

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-zinc-50 px-4 py-12 font-sans dark:bg-black">
      <AdminNav />
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Panel de administración
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Elegí una sección arriba: aprobar profesionales o mantener los catálogos de
        medicamentos, estudios y obras sociales.
      </p>
    </div>
  );
}
