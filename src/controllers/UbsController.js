import CreateUbsService from '../services/ubs/CreateUbsService.js';
import UpdateUbsService from '../services/ubs/UpdateUbsService.js';
import UbsRepository from '../repositories/UbsRepository.js';
import UbsDTO from '../dtos/UbsDTO.js';
import { createUbsSchema, updateUbsSchema } from '../validators/ubs.validator.js';
import AppError from '../errors/AppError.js';

class UbsController {
    async create(req, res) {
        const data = createUbsSchema.parse(req.body);
        const ubs = await CreateUbsService.execute(data);
        return res.status(201).json({ status: 'success', data: UbsDTO.toResponse(ubs) });
    }

    async index(req, res) {
        const { q } = req.query;
        const list = await UbsRepository.findManyActive(q);
        return res.status(200).json({ status: 'success', data: UbsDTO.toResponseArray(list) });
    }

    async show(req, res) {
        const ubs = await UbsRepository.findById(req.params.id);
        if (!ubs) throw new AppError('UBS não encontrada.', 404);
        return res.status(200).json({ status: 'success', data: UbsDTO.toResponse(ubs) });
    }

    async update(req, res) {
        const data = updateUbsSchema.parse(req.body);
        const ubs = await UpdateUbsService.execute(req.params.id, data, req.user);
        return res.status(200).json({ status: 'success', data: UbsDTO.toResponse(ubs) });
    }

    async delete(req, res) {
        const ubs = await UbsRepository.findById(req.params.id);
        if (!ubs) throw new AppError('UBS não encontrada.', 404);
        await UbsRepository.softDelete(req.params.id);
        return res.status(204).send();
    }

    async forceDelete(req, res) {
        await UbsRepository.hardDelete(req.params.id);
        return res.status(204).send();
    }
}
export default new UbsController();