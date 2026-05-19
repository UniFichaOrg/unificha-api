import bcrypt from 'bcrypt';
import UserRepository from '../../repositories/UserRepository.js';
import AppError from '../../errors/AppError.js';

class CreateUserService {
  async execute(data) {
    const loginExists = await UserRepository.findByLogin(data.login);
    if (loginExists) {
      throw new AppError('Este login já está em uso.', 409);
    }

    const documentExists = await UserRepository.findByCpfOrCns(data.cpf, data.cns);
    if (documentExists) {
      throw new AppError('Já existe um cadastro ativo associado a este CPF ou CNS.', 409);
    }

    const hashedPassword = await bcrypt.hash(data.senha, 10);

    const userToCreate = {
      ...data,
      senhaHash: hashedPassword,
    };
    delete userToCreate.senha;

    const newUser = await UserRepository.create(userToCreate);
    return newUser;
  }
}

export default new CreateUserService();