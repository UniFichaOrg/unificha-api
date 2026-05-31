import CreateAgendaService from '../services/agenda/CreateAgendaService.js';
import UpdateAgendaService from '../services/agenda/UpdateAgendaService.js';
import AgendaRepository from '../repositories/AgendaRepository.js';
import AgendaDTO from '../dtos/AgendaDTO.js';
import { createAgendaSchema, updateAgendaSchema } from '../validators/agenda.validator.js';
import AppError from '../errors/AppError.js';

class AgendaController {
    async create(req, res) {
        const data = createAgendaSchema.parse(req.body);
        const agenda = await CreateAgendaService.execute(data, req.user);
        return res.status(201).json({ status: 'success', data: AgendaDTO.toResponse(agenda) });
    }

    async index(req, res) {
        const list = await AgendaRepository.findManyActive();
        return res.status(200).json({ status: 'success', data: AgendaDTO.toResponseArray(list) });
    }

    async show(req, res) {
        const agenda = await AgendaRepository.findById(req.params.id);
        if (!agenda) throw new AppError('Configuração de agenda não encontrada.', 404);
        return res.status(200).json({ status: 'success', data: AgendaDTO.toResponse(agenda) });
    }

    async update(req, res) {
        const data = updateAgendaSchema.parse(req.body);
        const agenda = await UpdateAgendaService.execute(req.params.id, data, req.user);
        return res.status(200).json({ status: 'success', data: AgendaDTO.toResponse(agenda) });
    }

    async delete(req, res) {
        const agenda = await AgendaRepository.findById(req.params.id);
        if (!agenda) throw new AppError('Configuração de agenda não encontrada.', 404);
        await AgendaRepository.softDelete(req.params.id);
        return res.status(204).send();
    }

    async forceDelete(req, res) {
        await AgendaRepository.hardDelete(req.params.id);
        return res.status(204).send();
    }
}
export default new AgendaController();