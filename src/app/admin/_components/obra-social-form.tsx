"use client";

import { useActionState } from "react";
import { crearObraSocial } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ObraSocialForm() {
  const [state, formAction, pending] = useActionState(crearObraSocial, undefined);

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" required />
            {state?.errors?.nombre && (
              <p className="text-sm text-destructive">{state.errors.nombre[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vencimientoMedicamentosDias">Override medicamentos (días)</Label>
              <Input
                id="vencimientoMedicamentosDias"
                name="vencimientoMedicamentosDias"
                type="number"
                min={1}
                placeholder="Usa el default"
              />
              {state?.errors?.vencimientoMedicamentosDias && (
                <p className="text-sm text-destructive">
                  {state.errors.vencimientoMedicamentosDias[0]}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vencimientoEstudiosDias">Override estudios (días)</Label>
              <Input
                id="vencimientoEstudiosDias"
                name="vencimientoEstudiosDias"
                type="number"
                min={1}
                placeholder="Usa el default"
              />
              {state?.errors?.vencimientoEstudiosDias && (
                <p className="text-sm text-destructive">
                  {state.errors.vencimientoEstudiosDias[0]}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? "Agregando..." : "Agregar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
