import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Receta Electrónica
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Plataforma de recetas médicas electrónicas para profesionales de la salud.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="rounded border border-black px-4 py-2 text-black dark:border-white dark:text-white"
          >
            Registrarme
          </Link>
        </div>
      </main>
    </div>
  );
}
