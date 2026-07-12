"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { emitirReceta } from "@/app/actions/recetas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Paciente = { id: string; nombre: string; apellido: string; dni: string };
type CatalogoItem = { id: string; nombre: string };
type ObraSocial = { id: string; nombre: string };

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
  const [pacienteNuevo, setPacienteNuevo] = useState(pacientes.length === 0);
  const [cantidadItems, setCantidadItems] = useState(1);

  const catalogo = tipo === "MEDICAMENTO" ? medicamentos : estudios;
  const maxItems = tipo === "MEDICAMENTO" ? 3 : 1;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tipo">Tipo de prescripción</Label>
        <Select
          name="tipo"
          items={{ MEDICAMENTO: "Medicamento", ESTUDIO: "Estudio" }}
          defaultValue="MEDICAMENTO"
          onValueChange={(value) => {
            setTipo(value as "MEDICAMENTO" | "ESTUDIO");
            setCantidadItems(1);
          }}
        >
          <SelectTrigger id="tipo" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MEDICAMENTO">Medicamento</SelectItem>
            <SelectItem value="ESTUDIO">Estudio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>Paciente</CardTitle>
          {pacientes.length > 0 && (
            <div className="flex gap-1 rounded-lg bg-muted p-0.5 text-sm">
              <button
                type="button"
                onClick={() => setPacienteNuevo(false)}
                className={cn(
                  "rounded-md px-2.5 py-1 transition-colors",
                  !pacienteNuevo ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                Existente
              </button>
              <button
                type="button"
                onClick={() => setPacienteNuevo(true)}
                className={cn(
                  "rounded-md px-2.5 py-1 transition-colors",
                  pacienteNuevo ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                Nuevo
              </button>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {!pacienteNuevo && pacientes.length > 0 ? (
            <Select
              name="pacienteId"
              items={Object.fromEntries(
                pacientes.map((p) => [p.id, `${p.apellido}, ${p.nombre} — DNI ${p.dni}`])
              )}
              defaultValue={pacientes[0].id}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pacientes.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.apellido}, {p.nombre} — DNI {p.dni}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <input type="hidden" name="pacienteId" value="" />
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dni">DNI</Label>
                <Input id="dni" name="dni" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                <Input id="fechaNacimiento" name="fechaNacimiento" type="date" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombrePaciente">Nombre</Label>
                <Input id="nombrePaciente" name="nombrePaciente" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="apellidoPaciente">Apellido</Label>
                <Input id="apellidoPaciente" name="apellidoPaciente" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sexo">Sexo</Label>
                <Select
                  name="sexo"
                  required
                  items={{ FEMENINO: "Femenino", MASCULINO: "Masculino", OTRO: "Otro" }}
                >
                  <SelectTrigger id="sexo" className="w-full">
                    <SelectValue placeholder="Elegir..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FEMENINO">Femenino</SelectItem>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="obraSocialId">Obra social</Label>
                <Select
                  name="obraSocialId"
                  defaultValue="particular"
                  items={{
                    particular: "Particular (sin obra social)",
                    ...Object.fromEntries(obrasSociales.map((os) => [os.id, os.nombre])),
                  }}
                >
                  <SelectTrigger id="obraSocialId" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular">Particular (sin obra social)</SelectItem>
                    {obrasSociales.map((os) => (
                      <SelectItem key={os.id} value={os.id}>
                        {os.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="obraSocialCredencial">N° de credencial</Label>
                <Input id="obraSocialCredencial" name="obraSocialCredencial" />
              </div>
            </div>
          )}
          {state?.errors?.dni && <p className="mt-2 text-sm text-destructive">{state.errors.dni[0]}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tipo === "MEDICAMENTO" ? "Medicamentos" : "Estudio"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {Array.from({ length: cantidadItems }).map((_, i) => {
            const n = i + 1;
            return (
              <div
                key={n}
                className="grid grid-cols-2 gap-3 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label htmlFor={`item${n}_catalogoId`}>
                    {tipo === "MEDICAMENTO" ? `Medicamento ${n}` : "Estudio"}
                  </Label>
                  <Select
                    name={`item${n}_catalogoId`}
                    required
                    items={Object.fromEntries(catalogo.map((c) => [c.id, c.nombre]))}
                  >
                    <SelectTrigger id={`item${n}_catalogoId`} className="w-full">
                      <SelectValue placeholder="Elegir..." />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogo.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {tipo === "MEDICAMENTO" && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`item${n}_dosis`}>Dosis</Label>
                      <Input id={`item${n}_dosis`} name={`item${n}_dosis`} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`item${n}_frecuencia`}>Frecuencia</Label>
                      <Input id={`item${n}_frecuencia`} name={`item${n}_frecuencia`} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`item${n}_cantidad`}>Cantidad</Label>
                      <Input id={`item${n}_cantidad`} name={`item${n}_cantidad`} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`item${n}_viaAdministracion`}>Vía de administración</Label>
                      <Input id={`item${n}_viaAdministracion`} name={`item${n}_viaAdministracion`} />
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
              className="flex w-fit items-center gap-1 text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              <Plus className="size-3.5" />
              {cantidadItems >= maxItems
                ? "Máximo 3 medicamentos por receta"
                : "Agregar otro medicamento"}
            </button>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="diagnostico">Diagnóstico</Label>
        <Input id="diagnostico" name="diagnostico" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="indicaciones">Indicaciones</Label>
        <Textarea id="indicaciones" name="indicaciones" rows={3} />
      </div>

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

      <Button type="submit" disabled={pending} size="lg" className="w-fit">
        {pending ? "Emitiendo..." : "Emitir receta"}
      </Button>
    </form>
  );
}
