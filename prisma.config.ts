import { config } from "dotenv";
config({ path: ".env.local" });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Conexión directa (sin pgbouncer): las migraciones necesitan advisory locks
    // que el pooler de Neon no soporta.
    url: process.env.DATABASE_URL_UNPOOLED,
  },
});
