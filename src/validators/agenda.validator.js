import { z } from 'zod';

export const createAgendaSchema = z.object({
    idUbs: z.string().uuid('ID da UBS inválido'),
    especialidade: z.string().min(2, 'A especialidade é obrigatória'),
    horarioAbertura: z.string().regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM'),
    horarioFechamento: z.string().regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM'),
    cotaPrioritaria: z.number().int().min(0).default(0),
    cotaGeral: z.number().int().min(0).default(0),
    limiteFichasPorCidadao: z.number().int().min(1).default(3),
});

export const updateAgendaSchema = createAgendaSchema.partial();