"use client";

import { useActionState } from "react";
import { actualizarPerfil } from "@/app/actions/perfil";

export function PerfilForm({
  especialidad,
  matricula,
}: {
  especialidad: string | null;
  matricula: string | null;
}) {
  const [state, action, pending] = useActionState(actualizarPerfil, undefined);

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="especialidad" className="text-sm text-zinc-700 dark:text-zinc-300">
          Especialidad
        </label>
        <input
          id="especialidad"
          name="especialidad"
          defaultValue={especialidad ?? ""}
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        {state?.errors?.especialidad && (
          <p className="text-sm text-red-600">{state.errors.especialidad[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="matricula" className="text-sm text-zinc-700 dark:text-zinc-300">
          Matrícula
        </label>
        <input
          id="matricula"
          name="matricula"
          defaultValue={matricula ?? ""}
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        {state?.errors?.matricula && (
          <p className="text-sm text-red-600">{state.errors.matricula[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="firma" className="text-sm text-zinc-700 dark:text-zinc-300">
          Firma escaneada (PNG, JPG o WEBP)
        </label>
        <input
          id="firma"
          name="firma"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="text-sm text-zinc-700 dark:text-zinc-300"
        />
      </div>

      {state?.message && (
        <p className="text-sm text-zinc-700 dark:text-zinc-300">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Guardando..." : "Guardar perfil"}
      </button>
    </form>
  );
}
