"use client";

import { useActionState, useState } from "react";
import { emitirReceta } from "@/app/actions/recetas";

type Paciente = { id: string; nombre: string; apellido: string; dni: string };
type CatalogoItem = { id: string; nombre: string };
type ObraSocial = { id: string; nombre: string };

const inputClase =
  "rounded border border-zinc-300 bg-white px-3 py-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
const labelClase = "text-sm text-zinc-700 dark:text-zinc-300";

export function RecetaForm({
  pacientes,
  medicamentos,
  estudios,
  obrasSociales,
}: {
  pacientes: Paciente[];
  medicamentos: CatalogoItem[];
  estudios: CatalogoItem[];
  obrasSociales: ObraSocial[];
}) {
  const [state, formAction, pending] = useActionState(emitirReceta, undefined);
  const [tipo, setTipo] = useState<"MEDICAMENTO" | "ESTUDIO">("MEDICAMENTO");
  const [pacienteId, setPacienteId] = useState<string>(pacientes[0]?.id ?? "");
  const [pacienteNuevo, setPacienteNuevo] = useState(pacientes.length === 0);
  const [cantidadItems, setCantidadItems] = useState(1);

  const catalogo = tipo === "MEDICAMENTO" ? medicamentos : estudios;
  const maxItems = tipo === "MEDICAMENTO" ? 3 : 1;

  return (
    <form action={formAction} className="flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label className={labelClase}>Tipo de prescripción</label>
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => {
            const nuevoTipo = e.target.value as "MEDICAMENTO" | "ESTUDIO";
            setTipo(nuevoTipo);
            setCantidadItems(1);
          }}
          className={inputClase}
        >
          <option value="MEDICAMENTO">Medicamento</option>
          <option value="ESTUDIO">Estudio</option>
        </select>
      </div>

      <fieldset className="flex flex-col gap-3 rounded border border-zinc-300 p-4 dark:border-zinc-700">
        <legend className="px-1 text-sm font-medium text-black dark:text-zinc-50">Paciente</legend>

        {pacientes.length > 0 && (
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={!pacienteNuevo}
                onChange={() => setPacienteNuevo(false)}
              />
              Paciente existente
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" checked={pacienteNuevo} onChange={() => setPacienteNuevo(true)} />
              Paciente nuevo
            </label>
          </div>
        )}

        {!pacienteNuevo && pacientes.length > 0 ? (
          <select
            name="pacienteId"
            value={pacienteId}
            onChange={(e) => setPacienteId(e.target.value)}
            className={inputClase}
          >
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.apellido}, {p.nombre} — DNI {p.dni}
              </option>
            ))}
          </select>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <input type="hidden" name="pacienteId" value="" />
            <div className="flex flex-col gap-1">
              <label className={labelClase}>DNI</label>
              <input name="dni" required className={inputClase} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClase}>Fecha de nacimiento</label>
              <input name="fechaNacimiento" type="date" required className={inputClase} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClase}>Nombre</label>
              <input name="nombrePaciente" required className={inputClase} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClase}>Apellido</label>
              <input name="apellidoPaciente" required className={inputClase} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClase}>Sexo</label>
              <select name="sexo" required className={inputClase} defaultValue="">
                <option value="" disabled>
                  Elegir...
                </option>
                <option value="FEMENINO">Femenino</option>
                <option value="MASCULINO">Masculino</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClase}>Obra social</label>
              <select name="obraSocialId" className={inputClase} defaultValue="">
                <option value="">Particular (sin obra social)</option>
                {obrasSociales.map((os) => (
                  <option key={os.id} value={os.id}>
                    {os.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className={labelClase}>N° de credencial</label>
              <input name="obraSocialCredencial" className={inputClase} />
            </div>
          </div>
        )}
        {state?.errors?.dni && <p className="text-sm text-red-600">{state.errors.dni[0]}</p>}
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded border border-zinc-300 p-4 dark:border-zinc-700">
        <legend className="px-1 text-sm font-medium text-black dark:text-zinc-50">
          {tipo === "MEDICAMENTO" ? "Medicamentos" : "Estudio"}
        </legend>

        {Array.from({ length: cantidadItems }).map((_, i) => {
          const n = i + 1;
          return (
            <div key={n} className="grid grid-cols-2 gap-3 border-b border-zinc-200 pb-3 last:border-0 dark:border-zinc-800">
              <div className="col-span-2 flex flex-col gap-1">
                <label className={labelClase}>
                  {tipo === "MEDICAMENTO" ? `Medicamento ${n}` : "Estudio"}
                </label>
                <select name={`item${n}_catalogoId`} required className={inputClase} defaultValue="">
                  <option value="" disabled>
                    Elegir...
                  </option>
                  {catalogo.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {tipo === "MEDICAMENTO" && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className={labelClase}>Dosis</label>
                    <input name={`item${n}_dosis`} className={inputClase} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelClase}>Frecuencia</label>
                    <input name={`item${n}_frecuencia`} className={inputClase} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelClase}>Cantidad</label>
                    <input name={`item${n}_cantidad`} className={inputClase} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelClase}>Vía de administración</label>
                    <input name={`item${n}_viaAdministracion`} className={inputClase} />
                  </div>
                </>
              )}
            </div>
          );
        })}

        {tipo === "MEDICAMENTO" && (
          <button
            type="button"
            disabled={cantidadItems >= maxItems}
            onClick={() => setCantidadItems((c) => Math.min(c + 1, maxItems))}
            className="w-fit text-sm underline text-zinc-700 disabled:text-zinc-400 disabled:no-underline dark:text-zinc-300"
          >
            {cantidadItems >= maxItems ? "Máximo 3 medicamentos por receta" : "+ Agregar otro medicamento"}
          </button>
        )}
      </fieldset>

      <div className="flex flex-col gap-1">
        <label className={labelClase}>Diagnóstico</label>
        <input name="diagnostico" className={inputClase} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClase}>Indicaciones</label>
        <textarea name="indicaciones" rows={3} className={inputClase} />
      </div>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Emitiendo..." : "Emitir receta"}
      </button>
    </form>
  );
}
