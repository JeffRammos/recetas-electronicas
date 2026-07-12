import type { ProveedorAdapter, PublicarRecetaInput, PublicarRecetaResultado } from "./tipos";

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Implementación de prueba de ProveedorAdapter. El día que exista un
 * proveedor real, se escribe otra clase que implemente la misma interfaz
 * y se cambia el export en ./index.ts — nada más del código de la app
 * necesita cambiar.
 */
export class ProveedorSimulado implements ProveedorAdapter {
  async publicarReceta(input: PublicarRecetaInput): Promise<PublicarRecetaResultado> {
    await esperar(400);

    if (process.env.PROVEEDOR_SIMULAR_CAIDO === "true") {
      throw new Error("Proveedor simulado no disponible (PROVEEDOR_SIMULAR_CAIDO=true).");
    }

    return { externalId: `SIM-${input.recetaId.slice(-8)}-${Date.now().toString(36)}` };
  }
}
