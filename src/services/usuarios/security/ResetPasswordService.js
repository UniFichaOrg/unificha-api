import UserRepository from '../../../repositories/UsuarioRepository.js';
import AppError from '../../../errors/AppError.js';
import bcrypt from 'bcrypt';
import prisma from '../../../config/prisma.js';

class ResetPasswordService {
    async execute({ token, novaSenha }) {
        const user = await prisma.usuario.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gte: new Date() },
                deletadoEm: null,
            },
        });

        if (!user) {
            throw new AppError('Token de recuperação inválido ou expirado.', 400);
        }

        const senhaHash = await bcrypt.hash(novaSenha, 10);

        await prisma.usuario.update({
            where: { id: user.id },
            data: {
                senhaHash,
                resetPasswordToken: null,
                resetPasswordExpires: null,
                idMaquina: null,
                atualizadoEm: new Date(),
            },
        });
    }
}
export default new ResetPasswordService();