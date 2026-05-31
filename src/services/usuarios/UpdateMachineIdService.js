import UserRepository from '../../repositories/UsuarioRepository.js';
import bcrypt from 'bcrypt';
import AppError from '../../errors/AppError.js';

class UpdateMachineIdService {
    async execute({ userId, senhaAtual, novoIdMaquina }) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new AppError('Usuário não encontrado.', 404);

        const senhaValida = await bcrypt.compare(senhaAtual, user.senhaHash);
        if (!senhaValida) {
            throw new AppError('Senha incorreta. Confirme sua senha para registrar um novo dispositivo.', 401);
        }

        return await UserRepository.update(userId, { idMaquina: novoIdMaquina });
    }
}
export default new UpdateMachineIdService();