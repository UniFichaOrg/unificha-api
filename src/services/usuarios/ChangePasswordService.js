import UserRepository from '../../repositories/UsuarioRepository.js';
import bcrypt from 'bcrypt';
import AppError from '../../errors/AppError.js';

class ChangePasswordService {
    async execute({ userId, senhaAtual, novaSenha }) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new AppError('Usuário não encontrado.', 404);

        const senhaValida = await bcrypt.compare(senhaAtual, user.senhaHash);
        if (!senhaValida) {
            throw new AppError('Senha atual incorreta.', 401);
        }

        if (senhaAtual === novaSenha) {
            throw new AppError('A nova senha não pode ser igual à senha atual.', 422);
        }

        const senhaHash = await bcrypt.hash(novaSenha, 10);
        return await UserRepository.update(userId, { senhaHash });
    }
}
export default new ChangePasswordService();