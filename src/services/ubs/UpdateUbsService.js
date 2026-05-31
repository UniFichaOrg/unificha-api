import UbsRepository from '../../repositories/UbsRepository.js';
import AppError from '../../errors/AppError.js';

class UpdateUbsService {
    async execute(id, data, requestingUser) {
        const ubs = await UbsRepository.findById(id);
        if (!ubs) throw new AppError('UBS não encontrada.', 404);

        if (requestingUser.role === 'GESTOR' && ubs.idGestor !== requestingUser.id) {
            throw new AppError('Acesso negado: você só pode editar a UBS à qual está vinculado.', 403);
        }

        return await UbsRepository.update(id, data);
    }
}
export default new UpdateUbsService();