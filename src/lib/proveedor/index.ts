import { ProveedorSimulado } from "./simulado";
import type { ProveedorAdapter } from "./tipos";

export const proveedor: ProveedorAdapter = new ProveedorSimulado();

export * from "./tipos";
