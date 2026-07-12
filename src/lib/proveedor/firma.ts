import { createHmac, timingSafeEqual } from "node:crypto";

function secreto() {
  const valor = process.env.PROVEEDOR_WEBHOOK_SECRET;
  if (!valor) throw new Error("Falta configurar PROVEEDOR_WEBHOOK_SECRET.");
  return valor;
}

export function firmarPayload(payload: string): string {
  return createHmac("sha256", secreto()).update(payload).digest("hex");
}

export function verificarFirma(payload: string, firmaRecibida: string): boolean {
  const firmaEsperada = Buffer.from(firmarPayload(payload));
  const recibida = Buffer.from(firmaRecibida);
  return firmaEsperada.length === recibida.length && timingSafeEqual(firmaEsperada, recibida);
}
