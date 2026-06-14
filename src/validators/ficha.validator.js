import { z } from 'zod';

export const createFichaSchema = z.object({
    idConfiguracaoAgenda: z.string().uuid('ID de configuração de agenda inválido'),
    dataAtendimento: z.string().datetime('Data de atendimento inválida (ISO-8601)'),
    tipo: z.enum(['NORMAL', 'PRIORITARIA']),
    justificativa: z.string().max(255).optional(),
});

export const updateFichaStatusSchema = z.object({
    status: z.enum(['PENDENTE', 'CHAMADA', 'EM_ATENDIMENTO', 'CONCLUIDA', 'CANCELADA', 'AUSENTE']),
});

export const chamarProximoSchema = z.object({
    idConfiguracaoAgenda: z.string().uuid('ID da agenda é obrigatório'),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido. Use YYYY-MM-DD').optional(),
});