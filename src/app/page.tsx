export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Hola mundo
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Receta Electrónica — Fase 0: esqueleto Next.js en producción.
        </p>
      </main>
    </div>
  );
}
