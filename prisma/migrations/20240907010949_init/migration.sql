/*
  Warnings:

  - Made the column `nombre` on table `Departamento` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nombre` on table `Distrito` required. This step will fail if there are existing NULL values in that column.
  - Made the column `codigo` on table `Pais` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('DNI', 'RUC', 'PASAPORTE', 'CE');

-- CreateEnum
CREATE TYPE "Proveedor" AS ENUM ('EMAIL', 'GOOGLE', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('MASCULINO', 'FEMENINO');

-- AlterTable
ALTER TABLE "Departamento" ALTER COLUMN "nombre" SET NOT NULL;

-- AlterTable
ALTER TABLE "Distrito" ALTER COLUMN "nombre" SET NOT NULL;

-- AlterTable
ALTER TABLE "Pais" ALTER COLUMN "codigo" SET NOT NULL;

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "correo" TEXT NOT NULL,
    "constrasena" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "proveedor" "Proveedor" NOT NULL,
    "foto" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT NOT NULL,
    "tipoDoc" "TipoDocumento" NOT NULL,
    "numeroDoc" TEXT NOT NULL,
    "genero" "Genero" NOT NULL,
    "numeroCelular" TEXT NOT NULL,
    "idDistrito" INTEGER NOT NULL,
    "idCineFavorito" INTEGER,
    "idUsuario" INTEGER NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cine" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "imagen" TEXT,
    "idDistrito" INTEGER NOT NULL,

    CONSTRAINT "Cine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_idUsuario_key" ON "Cliente"("idUsuario");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_idCineFavorito_fkey" FOREIGN KEY ("idCineFavorito") REFERENCES "Cine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cine" ADD CONSTRAINT "Cine_idDistrito_fkey" FOREIGN KEY ("idDistrito") REFERENCES "Distrito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
