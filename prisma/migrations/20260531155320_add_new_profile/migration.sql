/*
  Warnings:

  - You are about to drop the column `perfil` on the `usuarios` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "TipoPerfil" ADD VALUE 'AGENTE';

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "perfil",
ADD COLUMN     "perfis" "TipoPerfil"[] DEFAULT ARRAY['CIDADAO']::"TipoPerfil"[];
