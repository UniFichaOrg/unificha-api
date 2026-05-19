import UserRepository from '../../repositories/UserRepository.js';
import AppError from '../../errors/AppError.js';

class DeleteUserService {
  async execute(id) {
    const userExists = await UserRepository.findById(id);
    if (!userExists) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    await UserRepository.softDelete(id);
  }
}

export default new DeleteUserService();