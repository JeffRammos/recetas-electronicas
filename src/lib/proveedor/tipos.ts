export type PublicarRecetaInput = {
  recetaId: string;
  numero: number;
  tipo: "MEDICAMENTO" | "ESTUDIO";
  profesionalMatricula: string;
  pacienteDni: string;
};

export type PublicarRecetaResultado = {
  externalId: string;
};

export interface ProveedorAdapter {
  publicarReceta(input: PublicarRecetaInput): Promise<PublicarRecetaResultado>;
}
