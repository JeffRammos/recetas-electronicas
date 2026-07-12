"use client";

import { useActionState } from "react";
import { crearObraSocial } from "@/app/actions/admin";

export function ObraSocialForm() {
  const [state, formAction, pending] = useActionState(crearObraSocial, undefined);

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="nombre" className="text-sm text-zinc-700 dark:text-zinc-300">
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          required
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        {state?.errors?.nombre && <p className="text-sm text-red-600">{state.errors.nombre[0]}</p>}
      </div>

      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor="vencimientoMedicamentosDias"
            className="text-sm text-zinc-700 dark:text-zinc-300"
          >
            Override vencimiento medicamentos (días)
          </label>
          <input
            id="vencimientoMedicamentosDias"
            name="vencimientoMedicamentosDias"
            type="number"
            min={1}
            placeholder="Usa el default"
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          {state?.errors?.vencimientoMedicamentosDias && (
            <p className="text-sm text-red-600">{state.errors.vencimientoMedicamentosDias[0]}</p>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="vencimientoEstudiosDias" className="text-sm text-zinc-700 dark:text-zinc-300">
            Override vencimiento estudios (días)
          </label>
          <input
            id="vencimientoEstudiosDias"
            name="vencimientoEstudiosDias"
            type="number"
            min={1}
            placeholder="Usa el default"
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          {state?.errors?.vencimientoEstudiosDias && (
            <p className="text-sm text-red-600">{state.errors.vencimientoEstudiosDias[0]}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Agregando..." : "Agregar"}
      </button>
    </form>
  );
}
