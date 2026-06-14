import { z } from 'zod';

export const createProfissionalSchema = z.object({
    nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
    especialidade: z.string().min(2, 'A especialidade é obrigatória'),
    area: z.string().min(2, 'A área de atuação é obrigatória (ex: Medicina, Enfermagem)'),
    registro: z.string().min(4, 'O registro profissional é obrigatório'),
    idUbs: z.array(z.string().uuid()).min(1, 'Vincule o profissional a pelo menos uma UBS'),
});

export const updateProfissionalSchema = createProfissionalSchema.partial().omit({ idUbs: true });

export const vincularUbsSchema = z.object({
    idUbs: z.array(z.string().uuid()).min(1, 'Informe pelo menos uma UBS'),
});