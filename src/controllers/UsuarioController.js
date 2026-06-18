import { createUserSchema, updateUserSchema } from '../validators/usuario.validator.js';
import CreateUserService from "../services/usuarios/management/CreateUsuarioService.js";
import UpdateUserService from '../services/usuarios/management/UpdateUsuarioService.js';
import DeleteUserService from '../services/usuarios/management/DeleteUsuarioService.js';
import UserRepository from '../repositories/UsuarioRepository.js';
import UsuarioDTO from '../dtos/UsuarioDTO.js';
import AppError from '../errors/AppError.js';

class UsuarioController {
    async create(req, res) {
        const validatedData = createUserSchema.parse(req.body);
        const user = await CreateUserService.execute(validatedData);
        return res.status(201).json({ status: 'success', data: UsuarioDTO.toResponse(user) });
    }

    async index(req, res) {
        const { q } = req.query;

        let users;
        if (q) {
            users = await UserRepository.search(q);
        } else {
            users = await UserRepository.findManyActive();
        }

        return res.status(200).json({ status: 'success', data: UsuarioDTO.toResponseArray(users) });
    }

    async show(req, res) {
        const { id } = req.params;

        if (req.user.roles?.includes('CIDADAO') && req.user.id !== id) {
            throw new AppError('Acesso negado: Você não tem permissão para visualizar este perfil.', 403);
        }

        const user = await UserRepository.findById(id);
        if (!user) throw new AppError('Usuário não encontrado.', 404);

        return res.status(200).json({ status: 'success', data: UsuarioDTO.toResponse(user) });
    }

    async update(req, res) {
        const { id } = req.params;

        if (req.user.roles?.includes('CIDADAO') && req.user.id !== id) {
            throw new AppError('Acesso negado: Você não tem permissão para atualizar este perfil.', 403);
        }

        const validatedData = updateUserSchema.parse(req.body);

        const user = await UpdateUserService.execute(id, validatedData);
        return res.status(200).json({ status: 'success', data: UsuarioDTO.toResponse(user) });
    }

    async delete(req, res) {
        const { id } = req.params;

        if (req.user.id === id) {
            throw new AppError('Operação inválida: Você não pode excluir a sua própria conta.', 400);
        }

        await DeleteUserService.execute(id);
        return res.status(204).send();
    }

    async forceDelete(req, res) {
        const { id } = req.params;

        if (req.user.id === id) {
            throw new AppError('Operação inválida: Você não pode excluir a sua própria conta definitivamente.', 400);
        }

        await UserRepository.hardDelete(id);
        return res.status(204).send();
    }
}

export default new UsuarioController();