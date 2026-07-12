import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sesion = await auth();
  if (!sesion) {
    return new NextResponse(null, { status: 401 });
  }

  const { id } = await params;
  const receta = await prisma.receta.findUnique({ where: { id }, include: { profesional: true } });
  if (!receta || !receta.pdfPath) {
    return new NextResponse(null, { status: 404 });
  }

  const esDueño = receta.profesional.usuarioId === sesion.user.id;
  if (!esDueño && sesion.user.rol !== "ADMIN") {
    return new NextResponse(null, { status: 403 });
  }

  const resultado = await get(receta.pdfPath, { access: "private" });
  if (!resultado || resultado.statusCode !== 200) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(resultado.stream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="receta-${receta.numero}.pdf"`,
    },
  });
}
