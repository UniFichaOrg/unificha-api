import { z } from 'zod';

export const authSchema = z.object({
  login: z.string().min(1, 'O login é obrigatório'),
  senha: z.string().min(1, 'A senha é obrigatória'),
  idMaquina: z.string().optional(),
});