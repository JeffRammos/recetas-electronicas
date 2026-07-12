import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { auth } from "@/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pathname: string[] }> }
) {
  const sesion = await auth();
  if (!sesion) {
    return new NextResponse(null, { status: 401 });
  }

  const { pathname: segmentos } = await params;
  const pathname = segmentos.join("/");

  const esPropia = pathname.startsWith(`firmas/${sesion.user.id}-`);
  if (!esPropia && sesion.user.rol !== "ADMIN") {
    return new NextResponse(null, { status: 403 });
  }

  const resultado = await get(pathname, { access: "private" });
  if (!resultado || resultado.statusCode !== 200) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(resultado.stream, {
    headers: { "Content-Type": resultado.blob.contentType },
  });
}
