import { cerrarSesion } from "@/app/actions/auth";
import { AppHeader } from "@/components/app-header";

const NAV = [
  { href: "/admin/profesionales", label: "Profesionales" },
  { href: "/admin/medicamentos", label: "Medicamentos" },
  { href: "/admin/estudios", label: "Estudios" },
  { href: "/admin/obras-sociales", label: "Obras sociales" },
];

export function AdminNav() {
  return <AppHeader links={NAV} cerrarSesionAction={cerrarSesion} />;
}
