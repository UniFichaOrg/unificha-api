import { z } from 'zod';

export const createUbsSchema = z.object({
    nome: z.string().min(3, 'O nome da UBS deve ter no mínimo 3 caracteres'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    bairro: z.string().min(1, 'O bairro é obrigatório'),
    municipio: z.string().min(1, 'O município é obrigatório'),
    politicaAtendimento: z.enum(['MUNICIPAL', 'ESTADUAL', 'FEDERAL']).default('MUNICIPAL'),
});

export const updateUbsSchema = createUbsSchema.partial();