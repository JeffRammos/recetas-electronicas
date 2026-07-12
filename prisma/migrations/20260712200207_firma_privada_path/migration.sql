/*
  Warnings:

  - You are about to drop the column `firmaUrl` on the `Profesional` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profesional" DROP COLUMN "firmaUrl",
ADD COLUMN     "firmaPath" TEXT;
