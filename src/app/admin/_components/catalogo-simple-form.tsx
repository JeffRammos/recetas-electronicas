"use client";

import { useActionState } from "react";
import type { CatalogoFormState } from "@/app/actions/admin";

export function CatalogoSimpleForm({
  action,
  vencimientoPorDefecto,
}: {
  action: (state: CatalogoFormState, formData: FormData) => Promise<CatalogoFormState>;
  vencimientoPorDefecto: number;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex w-full max-w-md items-end gap-2">
      <div className="flex flex-1 flex-col gap-1">
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

      <div className="flex w-32 flex-col gap-1">
        <label htmlFor="vencimientoDias" className="text-sm text-zinc-700 dark:text-zinc-300">
          Vence (días)
        </label>
        <input
          id="vencimientoDias"
          name="vencimientoDias"
          type="number"
          min={1}
          defaultValue={vencimientoPorDefecto}
          required
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        {state?.errors?.vencimientoDias && (
          <p className="text-sm text-red-600">{state.errors.vencimientoDias[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Agregando..." : "Agregar"}
      </button>
    </form>
  );
}
