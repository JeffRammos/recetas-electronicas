"use client";

import { useActionState } from "react";
import type { CatalogoFormState } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CatalogoSimpleForm({
  action,
  vencimientoPorDefecto,
}: {
  action: (state: CatalogoFormState, formData: FormData) => Promise<CatalogoFormState>;
  vencimientoPorDefecto: number;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <div className="flex min-w-48 flex-1 flex-col gap-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" required />
            {state?.errors?.nombre && (
              <p className="text-sm text-destructive">{state.errors.nombre[0]}</p>
            )}
          </div>

          <div className="flex w-32 flex-col gap-1.5">
            <Label htmlFor="vencimientoDias">Vence (días)</Label>
            <Input
              id="vencimientoDias"
              name="vencimientoDias"
              type="number"
              min={1}
              defaultValue={vencimientoPorDefecto}
              required
            />
            {state?.errors?.vencimientoDias && (
              <p className="text-sm text-destructive">{state.errors.vencimientoDias[0]}</p>
            )}
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Agregando..." : "Agregar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
