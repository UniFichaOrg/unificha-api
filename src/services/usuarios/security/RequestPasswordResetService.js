import UserRepository from '../../../repositories/UsuarioRepository.js';
import AppError from '../../../errors/AppError.js';
import crypto from 'crypto';
import prisma from '../../../config/prisma.js';

class RequestPasswordResetService {
    async execute({ email }) {
        const user = await UserRepository.findByEmail(email);
        if (!user) return;

        const token = crypto.randomBytes(32).toString('hex');
        const expiracao = new Date(Date.now() + 1000 * 60 * 60);

        await prisma.usuario.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: token,
                resetPasswordExpires: expiracao,
                atualizadoEm: new Date(),
            },
        });

        // TODO: disparar e-mail com o token (integrar nodemailer ou serviço externo)
        // O link seria: https://unificha.app/reset-password?token=<token>
        console.log(`[DEV] Token de reset para ${email}: ${token}`);
    }
}
export default new RequestPasswordResetService();