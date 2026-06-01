import UserRepository from '../../../repositories/UsuarioRepository.js';
import AppError from '../../../errors/AppError.js';

class DeleteUsuarioService {
  async execute(id) {
    const userExists = await UserRepository.findById(id);
    if (!userExists) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    await UserRepository.softDelete(id);
  }
}

export default new DeleteUsuarioService();