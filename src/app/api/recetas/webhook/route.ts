import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarFirma } from "@/lib/proveedor/firma";

type PayloadWebhook = {
  eventId: string;
  externalId: string;
  evento: "DISPENSADA";
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const firma = request.headers.get("x-proveedor-signature");

  if (!firma || !verificarFirma(rawBody, firma)) {
    return new NextResponse(null, { status: 401 });
  }

  let payload: PayloadWebhook;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  // Idempotencia: se intenta crear el registro del evento ANTES de procesar
  // nada. Si choca contra el unique (ya lo vimos), no se repite el efecto.
  try {
    await prisma.webhookEvento.create({ data: { eventId: payload.eventId } });
  } catch {
    return NextResponse.json({ ok: true, idempotente: true });
  }

  if (payload.evento === "DISPENSADA") {
    const receta = await prisma.receta.findUnique({ where: { proveedorExternalId: payload.externalId } });
    if (receta && receta.estado === "EMITIDA") {
      await prisma.receta.update({ where: { id: receta.id }, data: { estado: "DISPENSADA" } });
    }
  }

  return NextResponse.json({ ok: true });
}
