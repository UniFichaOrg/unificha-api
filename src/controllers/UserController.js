import { createUserSchema, updateUserSchema } from '../validators/user.validator.js';
import CreateUserService from '../services/users/CreateUserService.js';
import UpdateUserService from '../services/users/UpdateUserService.js';
import DeleteUserService from '../services/users/DeleteUserService.js';
import UserRepository from '../repositories/UserRepository.js';
import UserDTO from '../dtos/UserDTO.js';
import AppError from '../errors/AppError.js';

class UserController {
  async create(req, res) {
    const validatedData = createUserSchema.parse(req.body);
    const user = await CreateUserService.execute(validatedData);
    return res.status(201).json({ status: 'success', data: UserDTO.toResponse(user) });
  }

  async index(req, res) {
    const { q } = req.query;
    
    let users;
    if (q) {
      users = await UserRepository.search(q);
    } else {
      users = await UserRepository.findManyActive();
    }

    return res.status(200).json({ status: 'success', data: UserDTO.toResponseArray(users) });
  }

  async show(req, res) {
    const { id } = req.params;
    const user = await UserRepository.findById(id);

    if (!user) throw new AppError('Usuário não encontrado.', 404);

    return res.status(200).json({ status: 'success', data: UserDTO.toResponse(user) });
  }

  async update(req, res) {
    const { id } = req.params;
    const validatedData = updateUserSchema.parse(req.body);
    
    const user = await UpdateUserService.execute(id, validatedData);
    return res.status(200).json({ status: 'success', data: UserDTO.toResponse(user) });
  }

  async delete(req, res) {
    const { id } = req.params;
    await DeleteUserService.execute(id);
    
    return res.status(204).send();
  }
}

export default new UserController();