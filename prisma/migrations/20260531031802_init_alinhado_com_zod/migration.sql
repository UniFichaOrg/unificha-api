-- CreateEnum
CREATE TYPE "PoliticaAbrangencia" AS ENUM ('MUNICIPAL', 'ESTADUAL', 'FEDERAL');

-- CreateEnum
CREATE TYPE "TipoPerfil" AS ENUM ('ADMIN', 'GESTOR', 'CIDADAO');

-- CreateEnum
CREATE TYPE "TipoFicha" AS ENUM ('NORMAL', 'PRIORITARIA');

-- CreateEnum
CREATE TYPE "StatusFicha" AS ENUM ('PENDENTE', 'CONCLUIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "ubs" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "latitude" DECIMAL(10,6),
    "longitude" DECIMAL(10,6),
    "bairro" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "politica_atendimento" "PoliticaAbrangencia",
    "criado_em" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3),
    "deletado_em" TIMESTAMP(3),

    CONSTRAINT "ubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "nome_social" TEXT,
    "nome_usuario" TEXT,
    "login" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "cns" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "id_maquina" TEXT,
    "perfil" "TipoPerfil" NOT NULL DEFAULT 'CIDADAO',
    "logradouro" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3),
    "deletado_em" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes_agenda" (
    "id" UUID NOT NULL,
    "id_ubs" UUID NOT NULL,
    "especialidade" TEXT NOT NULL,
    "horario_abertura" TEXT NOT NULL,
    "horario_fechamento" TEXT NOT NULL,
    "cota_prioritaria" INTEGER,
    "cota_geral" INTEGER,
    "criado_em" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3),
    "deletado_em" TIMESTAMP(3),

    CONSTRAINT "configuracoes_agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fichas" (
    "id" UUID NOT NULL,
    "id_usuario" UUID NOT NULL,
    "id_configuracao_agenda" UUID NOT NULL,
    "data_atendimento" TIMESTAMP(3) NOT NULL,
    "tipo" "TipoFicha",
    "justificativa" TEXT,
    "status" "StatusFicha",
    "auditoria_id_maquina" TEXT,
    "auditoria_ip" TEXT,
    "criado_em" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3),
    "deletado_em" TIMESTAMP(3),

    CONSTRAINT "fichas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_login_key" ON "usuarios"("login");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cns_key" ON "usuarios"("cns");

-- AddForeignKey
ALTER TABLE "configuracoes_agenda" ADD CONSTRAINT "configuracoes_agenda_id_ubs_fkey" FOREIGN KEY ("id_ubs") REFERENCES "ubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichas" ADD CONSTRAINT "fichas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichas" ADD CONSTRAINT "fichas_id_configuracao_agenda_fkey" FOREIGN KEY ("id_configuracao_agenda") REFERENCES "configuracoes_agenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
