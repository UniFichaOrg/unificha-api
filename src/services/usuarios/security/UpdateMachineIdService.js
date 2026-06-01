import UserRepository from '../../../repositories/UsuarioRepository.js';
import bcrypt from 'bcrypt';
import AppError from '../../../errors/AppError.js';
import prisma from '../../../config/prisma.js';

class UpdateMachineIdService {
    async execute({ userId, senhaAtual, novoIdMaquina, codigoVerificacao }) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new AppError('Usuário não encontrado.', 404);

        const senhaValida = await bcrypt.compare(senhaAtual, user.senhaHash);
        if (!senhaValida) {
            throw new AppError('Senha incorreta. Ação não permitida.', 401);
        }

        if (!user.codigoDispositivo || user.codigoDispositivo !== codigoVerificacao) {
            throw new AppError('Código de verificação inválido.', 400);
        }

        if (new Date() > new Date(user.codigoDispositivoExpires)) {
            throw new AppError('O código de verificação expirou. Solicite um novo.', 400);
        }

        await prisma.usuario.update({
            where: { id: userId },
            data: {
                idMaquina: novoIdMaquina,
                codigoDispositivo: null,
                codigoDispositivoExpires: null,
                atualizadoEm: new Date()
            }
        });
    }
}
export default new UpdateMachineIdService();