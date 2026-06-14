import { z } from 'zod';

export const createUserSchema = z.object({
  // Identificação Pessoal
  nomeCompleto: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  nomeSocial: z.string().optional(),
  nomeUsuario: z.string().optional(),
  
  // Credenciais
  login: z.string().min(4, 'O login deve ter no mínimo 4 caracteres'),
  senha: z.string().min(8, 'A senha é obrigatória e deve ter no mínimo 8 caracteres'),
  email: z.string().email('E-mail válido é obrigatório para o envio de comprovantes'),
  
  // Documentação
  cpf: z.string().length(11, 'O CPF é obrigatório e deve conter exatamente 11 dígitos'),
  cns: z.string().length(15, 'O CNS é obrigatório e deve conter exatamente 15 dígitos'),
  
  // Endereço Completo
  cep: z.string().length(8, 'O CEP deve conter exatamente 8 dígitos, sem traços'),
  logradouro: z.string().min(1, 'O logradouro é obrigatório'),
  bairro: z.string().min(1, 'O bairro é obrigatório'),
  municipio: z.string().min(1, 'O município é obrigatório'),
  uf: z.string().length(2, 'A UF deve conter exatamente 2 letras'),

  // Sistema
  idMaquina: z.string().optional(),
    perfis: z.array(z.enum(['ADMIN', 'GESTOR', 'AGENTE', 'CIDADAO'])).optional().default(['CIDADAO']),
});

export const updateUserSchema = z.object({
  nomeCompleto: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres').optional(),
  nomeSocial: z.string().optional(),
  nomeUsuario: z.string().optional(),
  email: z.string().email('E-mail inválido').optional(),
  cpf: z.string().length(11, 'O CPF deve conter exatamente 11 dígitos').optional(),
  cns: z.string().length(15, 'O CNS deve conter exatamente 15 dígitos').optional(),
  cep: z.string().length(8, 'O CEP deve conter exatamente 8 dígitos').optional(),
  logradouro: z.string().min(1, 'O logradouro não pode ser vazio').optional(),
  bairro: z.string().min(1, 'O bairro não pode ser vazio').optional(),
  municipio: z.string().min(1, 'O município não pode ser vazio').optional(),
  uf: z.string().length(2, 'A UF deve ter 2 letras').optional(),
  perfis: z.enum(['ADMIN', 'GESTOR', 'AGENTE', 'CIDADAO']).optional(),
});