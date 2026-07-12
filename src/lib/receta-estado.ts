type Tono = "success" | "warning" | "destructive" | "muted" | "info";

export function estadoRecetaDisplay(receta: { estado: string; fechaVencimiento: Date }): {
  tono: Tono;
  texto: string;
} {
  const vencida = receta.estado === "EMITIDA" && receta.fechaVencimiento < new Date();

  if (receta.estado === "ANULADA") return { tono: "muted", texto: "Anulada" };
  if (receta.estado === "DISPENSADA") return { tono: "info", texto: "Dispensada" };
  if (receta.estado === "PENDIENTE_SYNC") return { tono: "warning", texto: "Pendiente de sincronizar" };
  if (vencida) return { tono: "warning", texto: "Vencida" };
  return { tono: "success", texto: "Emitida" };
}
