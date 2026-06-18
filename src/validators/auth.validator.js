import { z } from 'zod';

export const authSchema = z.object({
  login: z.string().min(1, 'O login é obrigatório'),
  senha: z.string().min(1, 'A senha é obrigatória'),
  idMaquina: z.string().optional(),
});

export const requestPasswordResetSchema = z.object({
    email: z.string().email('Informe um e-mail válido'),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token é obrigatório'),
    novaSenha: z.string().min(8, 'A nova senha deve ter no mínimo 8 caracteres'),
});

export const changePasswordSchema = z.object({
    senhaAtual: z.string().min(1, 'Informe a senha atual'),
    novaSenha: z.string().min(8, 'A nova senha deve ter no mínimo 8 caracteres'),
});

export const updateMachineIdSchema = z.object({
    senhaAtual: z.string().min(1, 'Confirme sua senha para registrar o novo dispositivo'),
    novoIdMaquina: z.string().min(1, 'ID do novo dispositivo é obrigatório'),
    codigoVerificacao: z.string().min(1, 'O código de verificação é obrigatório'), // Adicione esta linha
});