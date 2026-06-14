-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StatusFicha" ADD VALUE 'CHAMADA';
ALTER TYPE "StatusFicha" ADD VALUE 'EM_ATENDIMENTO';
ALTER TYPE "StatusFicha" ADD VALUE 'AUSENTE';

-- AlterTable
ALTER TABLE "fichas" ADD COLUMN     "finalizado_em" TIMESTAMP(3),
ADD COLUMN     "iniciado_em" TIMESTAMP(3),
ADD COLUMN     "observacao" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDENTE';

-- AlterTable
ALTER TABLE "ubs" ADD COLUMN     "fila_motivo_pausa" TEXT,
ADD COLUMN     "fila_pausada" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "codigo_dispositivo" TEXT,
ADD COLUMN     "codigo_dispositivo_expires" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "profissionais" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "registro" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3),
    "deletado_em" TIMESTAMP(3),

    CONSTRAINT "profissionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profissional_ubs" (
    "id" UUID NOT NULL,
    "id_profissional" UUID NOT NULL,
    "id_ubs" UUID NOT NULL,
    "criado_em" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profissional_ubs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_registro_key" ON "profissionais"("registro");

-- CreateIndex
CREATE UNIQUE INDEX "profissional_ubs_id_profissional_id_ubs_key" ON "profissional_ubs"("id_profissional", "id_ubs");

-- AddForeignKey
ALTER TABLE "profissional_ubs" ADD CONSTRAINT "profissional_ubs_id_profissional_fkey" FOREIGN KEY ("id_profissional") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profissional_ubs" ADD CONSTRAINT "profissional_ubs_id_ubs_fkey" FOREIGN KEY ("id_ubs") REFERENCES "ubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
