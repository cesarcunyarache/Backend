/*
  Warnings:

  - You are about to drop the column `constrasena` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `contrasena` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cine" ADD COLUMN     "descripcion" TEXT;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "constrasena",
ADD COLUMN     "contrasena" TEXT NOT NULL;
