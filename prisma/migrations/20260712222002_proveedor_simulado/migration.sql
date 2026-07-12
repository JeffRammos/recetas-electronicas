-- AlterEnum
ALTER TYPE "EstadoReceta" ADD VALUE 'PENDIENTE_SYNC';
ALTER TYPE "EstadoReceta" ADD VALUE 'DISPENSADA';

-- AlterTable
ALTER TABLE "Receta" ADD COLUMN "proveedorExternalId" TEXT;

-- CreateTable
CREATE TABLE "WebhookEvento" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "procesadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Receta_proveedorExternalId_key" ON "Receta"("proveedorExternalId");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvento_eventId_key" ON "WebhookEvento"("eventId");
