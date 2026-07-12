import Link from "next/link";
import { cerrarSesion } from "@/app/actions/auth";

const LINKS = [
  { href: "/admin/profesionales", label: "Profesionales" },
  { href: "/admin/medicamentos", label: "Medicamentos" },
  { href: "/admin/estudios", label: "Estudios" },
  { href: "/admin/obras-sociales", label: "Obras sociales" },
];

export function AdminNav() {
  return (
    <nav className="flex w-full max-w-2xl items-center justify-between">
      <div className="flex gap-4 text-sm">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="underline text-zinc-700 dark:text-zinc-300">
            {link.label}
          </Link>
        ))}
      </div>
      <form action={cerrarSesion}>
        <button type="submit" className="text-sm underline text-zinc-600 dark:text-zinc-400">
          Cerrar sesión
        </button>
      </form>
    </nav>
  );
}
