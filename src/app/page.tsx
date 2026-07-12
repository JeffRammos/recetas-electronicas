import Link from "next/link";
import { FileSignature, ShieldCheck, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

const RASGOS = [
  {
    icono: FileSignature,
    titulo: "Firma digitalizada",
    texto: "Tu firma escaneada, estampada en cada PDF que emitís.",
  },
  {
    icono: ShieldCheck,
    titulo: "Matrícula validada",
    texto: "Un admin aprueba tu perfil antes de que puedas prescribir.",
  },
  {
    icono: Timer,
    titulo: "Vencimientos claros",
    texto: "Cada receta calcula sola su fecha de vencimiento.",
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-12rem] left-1/2 h-[28rem] w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      <main className="relative flex w-full max-w-2xl flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
            Receta electrónica
          </p>
          <h1 className="font-heading text-5xl text-foreground italic sm:text-6xl">
            Recetá desde donde estés.
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            Plataforma de recetas médicas electrónicas para profesionales de la salud: cargá
            tu perfil, emití y firmá recetas en minutos.
          </p>
        </div>

        <div className="flex gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/login" />}>
            Iniciar sesión
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/registro" />}
          >
            Registrarme
          </Button>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 border-t border-border pt-10 text-left sm:grid-cols-3">
          {RASGOS.map(({ icono: Icono, titulo, texto }) => (
            <div key={titulo} className="flex flex-col gap-2">
              <Icono className="size-5 text-secondary" strokeWidth={1.75} />
              <p className="text-sm font-medium text-foreground">{titulo}</p>
              <p className="text-sm text-muted-foreground">{texto}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
