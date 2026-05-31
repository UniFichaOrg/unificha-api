import CreateFichaService from '../services/fichas/CreateFichaService.js';
import FichaRepository from '../repositories/FichaRepository.js';
import FichaDTO from '../dtos/FichaDTO.js';
import { createFichaSchema, updateFichaStatusSchema } from '../validators/ficha.validator.js';
import AppError from '../errors/AppError.js';
import prisma from '../config/prisma.js';

class FichaController {
    async create(req, res) {
        const data = createFichaSchema.parse(req.body);
        const ipCliente = req.ip || req.headers['x-forwarded-for'];
        const ficha = await CreateFichaService.execute({
            idUsuario: req.user.id,
            ...data,
            ipCliente,
        });
        return res.status(201).json({ status: 'success', data: FichaDTO.toResponse(ficha) });
    }

    async index(req, res) {
        const { status, data, idUbs } = req.query;
        const fichas = await FichaRepository.findManyFiltered({ status, data, idUbs });
        return res.status(200).json({ status: 'success', data: FichaDTO.toResponseArray(fichas) });
    }

    async me(req, res) {
        const fichas = await FichaRepository.findManyByUser(req.user.id);
        return res.status(200).json({ status: 'success', data: FichaDTO.toResponseArray(fichas) });
    }

    async show(req, res) {
        const ficha = await FichaRepository.findById(req.params.id);
        if (!ficha) throw new AppError('Ficha não encontrada.', 404);

        if (req.user.role === 'CIDADAO' && ficha.idUsuario !== req.user.id) {
            throw new AppError('Acesso negado.', 403);
        }
        return res.status(200).json({ status: 'success', data: FichaDTO.toResponse(ficha) });
    }

    async updateStatus(req, res) {
        const { status } = updateFichaStatusSchema.parse(req.body);
        const ficha = await FichaRepository.findById(req.params.id);
        if (!ficha) throw new AppError('Ficha não encontrada.', 404);

        if (['CONCLUIDA', 'CANCELADA'].includes(ficha.status)) {
            throw new AppError('Esta ficha já foi finalizada e não pode ser alterada.', 422);
        }

        if (req.user.role === 'CIDADAO') {
            if (ficha.idUsuario !== req.user.id) throw new AppError('Acesso negado.', 403);
            if (status !== 'CANCELADA') throw new AppError('Cidadão só pode cancelar fichas.', 403);
        }

        const updated = await prisma.ficha.update({
            where: { id: req.params.id },
            data: { status, atualizadoEm: new Date() },
        });
        return res.status(200).json({ status: 'success', data: FichaDTO.toResponse(updated) });
    }

    async delete(req, res) {
        const ficha = await FichaRepository.findById(req.params.id);
        if (!ficha) throw new AppError('Ficha não encontrada.', 404);
        await prisma.ficha.update({ where: { id: req.params.id }, data: { deletadoEm: new Date() } });
        return res.status(204).send();
    }

    async forceDelete(req, res) {
        await prisma.ficha.delete({ where: { id: req.params.id } });
        return res.status(204).send();
    }
}
export default new FichaController();