import { z } from 'zod';

export const createFichaSchema = z.object({
    idConfiguracaoAgenda: z.string().uuid('ID de configuração de agenda inválido'),
    dataAtendimento: z.string().datetime('Data de atendimento inválida (ISO-8601)'),
    tipo: z.enum(['NORMAL', 'PRIORITARIA']),
    justificativa: z.string().max(255).optional(),
});

export const updateFichaStatusSchema = z.object({
    status: z.enum(['PENDENTE', 'CONCLUIDA', 'CANCELADA']),
});