"use client";

import Link from "next/link";
import { useActionState } from "react";
import { iniciarSesion } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [state, action, pending] = useActionState(iniciarSesion, undefined);

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader className="gap-1 text-center">
          <Link href="/" className="mb-2 font-heading text-lg text-secondary italic">
            Receta<span className="text-primary not-italic">.</span>
          </Link>
          <CardTitle className="text-xl">Iniciar sesión</CardTitle>
        </CardHeader>

        <CardContent>
          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

            <Button type="submit" disabled={pending} className="mt-2 w-full">
              {pending ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tenés cuenta?{" "}
            <Link href="/registro" className="font-medium text-primary hover:underline">
              Registrate
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
