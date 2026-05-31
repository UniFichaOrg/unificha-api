import UserRepository from '../../repositories/UsuarioRepository.js';
import AppError from '../../errors/AppError.js';

class UpdateUsuarioService {
  async execute(id, data) {
    const userExists = await UserRepository.findById(id);
    if (!userExists) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    if (data.cpf || data.cns) {
      const documentExists = await UserRepository.findByCpfOrCns(data.cpf, data.cns);
      if (documentExists && documentExists.id !== id) {
        throw new AppError('Este CPF ou CNS já está vinculado a outra conta.', 409);
      }
    }

    const updatedUser = await UserRepository.update(id, data);
    return updatedUser;
  }
}

export default new UpdateUsuarioService();