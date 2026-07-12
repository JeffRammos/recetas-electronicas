import * as z from "zod";

export const RegistroSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.email("Ingresá un email válido.").trim(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .regex(/[a-zA-Z]/, "Debe contener al menos una letra.")
    .regex(/[0-9]/, "Debe contener al menos un número."),
});

export const PerfilSchema = z.object({
  especialidad: z.string().trim().min(2, "Ingresá una especialidad.").optional().or(z.literal("")),
  matricula: z.string().trim().min(2, "Ingresá un número de matrícula.").optional().or(z.literal("")),
});

const diasOpcionales = z.preprocess(
  (valor) => (valor === "" ? undefined : valor),
  z.coerce.number().int().positive("Tiene que ser un número de días positivo.").optional()
);

export const CatalogoSimpleSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá un nombre."),
  vencimientoDias: z.coerce.number().int().positive("Tiene que ser un número de días positivo."),
});

export const ObraSocialSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá un nombre."),
  vencimientoMedicamentosDias: diasOpcionales,
  vencimientoEstudiosDias: diasOpcionales,
});

export const PacienteSchema = z.object({
  dni: z.string().trim().min(6, "DNI inválido.").max(12, "DNI inválido."),
  nombre: z.string().trim().min(2, "Ingresá el nombre."),
  apellido: z.string().trim().min(2, "Ingresá el apellido."),
  fechaNacimiento: z.coerce.date({ error: "Ingresá una fecha de nacimiento válida." }),
  sexo: z.enum(["MASCULINO", "FEMENINO", "OTRO"]),
  obraSocialId: z.string().trim().optional().or(z.literal("")),
  obraSocialCredencial: z.string().trim().optional().or(z.literal("")),
});

export const RecetaItemSchema = z.object({
  catalogoId: z.string().min(1, "Elegí un ítem del catálogo."),
  dosis: z.string().trim().optional().or(z.literal("")),
  frecuencia: z.string().trim().optional().or(z.literal("")),
  cantidad: z.string().trim().optional().or(z.literal("")),
  viaAdministracion: z.string().trim().optional().or(z.literal("")),
});

export const RecetaSchema = z.object({
  tipo: z.enum(["MEDICAMENTO", "ESTUDIO"]),
  pacienteId: z.string().trim().optional().or(z.literal("")),
  diagnostico: z.string().trim().optional().or(z.literal("")),
  indicaciones: z.string().trim().optional().or(z.literal("")),
});
