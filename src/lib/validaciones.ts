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
