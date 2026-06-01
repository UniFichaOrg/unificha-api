import UserRepository from '../../repositories/UsuarioRepository.js';
import AppError from '../../errors/AppError.js';
import crypto from 'crypto';
import prisma from '../../config/prisma.js';

class RequestDeviceChangeService {
    async execute(userId) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new AppError('Usuário não encontrado.', 404);

        const codigo = crypto.randomBytes(3).toString('hex').toUpperCase();
        const expiracao = new Date(Date.now() + 1000 * 60 * 15);

        await prisma.usuario.update({
            where: { id: user.id },
            data: {
                codigoDispositivo: codigo,
                codigoDispositivoExpires: expiracao,
                atualizadoEm: new Date(),
            },
        });

        // Simulação de disparo de e-mail (Substituir por Nodemailer no futuro)
        console.log(`[Segurança] E-mail enviado para ${user.email}. Código OTP: ${codigo}`);

        return { message: 'Um código de verificação foi enviado para o seu e-mail.' };
    }
}
export default new RequestDeviceChangeService();