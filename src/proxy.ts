import { NextResponse } from "next/server";
import { auth } from "@/auth";

const RUTAS_PROFESIONAL = ["/perfil", "/recetas"];
const RUTAS_ADMIN = ["/admin"];
const RUTAS_SOLO_ANONIMO = ["/login", "/registro"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const sesion = req.auth;

  const esRutaProfesional = RUTAS_PROFESIONAL.some((ruta) => pathname.startsWith(ruta));
  const esRutaAdmin = RUTAS_ADMIN.some((ruta) => pathname.startsWith(ruta));

  if (!sesion && (esRutaProfesional || esRutaAdmin)) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (sesion && esRutaAdmin && sesion.user.rol !== "ADMIN") {
    return NextResponse.redirect(new URL("/perfil", req.nextUrl));
  }

  if (sesion && esRutaProfesional && sesion.user.rol !== "PROFESIONAL") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  if (sesion && RUTAS_SOLO_ANONIMO.includes(pathname)) {
    const destino = sesion.user.rol === "ADMIN" ? "/admin" : "/perfil";
    return NextResponse.redirect(new URL(destino, req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|svg|ico)$).*)"],
};
