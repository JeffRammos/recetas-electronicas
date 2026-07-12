"use client";

import { useActionState } from "react";
import { actualizarPerfil } from "@/app/actions/perfil";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PerfilForm({
  especialidad,
  matricula,
}: {
  especialidad: string | null;
  matricula: string | null;
}) {
  const [state, action, pending] = useActionState(actualizarPerfil, undefined);

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="especialidad">Especialidad</Label>
        <Input id="especialidad" name="especialidad" defaultValue={especialidad ?? ""} />
        {state?.errors?.especialidad && (
          <p className="text-sm text-destructive">{state.errors.especialidad[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="matricula">Matrícula</Label>
        <Input id="matricula" name="matricula" defaultValue={matricula ?? ""} />
        {state?.errors?.matricula && (
          <p className="text-sm text-destructive">{state.errors.matricula[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="firma">Firma escaneada (PNG, JPG o WEBP)</Label>
        <Input id="firma" name="firma" type="file" accept="image/png,image/jpeg,image/webp" />
      </div>

      {state?.message && <p className="text-sm text-muted-foreground">{state.message}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : "Guardar perfil"}
      </Button>
    </form>
  );
}
