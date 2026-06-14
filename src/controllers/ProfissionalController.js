import ProfissionalRepository from '../repositories/ProfissionalRepository.js';
import { createProfissionalSchema, updateProfissionalSchema } from '../validators/profissional.validator.js';
import AppError from '../errors/AppError.js';

class ProfissionalController {
    async create(req, res) {
        const data = createProfissionalSchema.parse(req.body);
        const profissional = await ProfissionalRepository.create(data);
        return res.status(201).json({ status: 'success', data: profissional });
    }

    async index(req, res) {
        const profissionais = await ProfissionalRepository.findMany(req.query);

        const porArea = profissionais.reduce((acc, curr) => {
            if (!acc[curr.area]) acc[curr.area] = [];
            acc[curr.area].push(curr);
            return acc;
        }, {});

        return res.status(200).json({ status: 'success', data: { porArea } });
    }

    async show(req, res) {
        const profissional = await ProfissionalRepository.findById(req.params.id);
        if (!profissional) throw new AppError('Profissional não encontrado', 404);
        return res.status(200).json({ status: 'success', data: profissional });
    }

    async update(req, res) {
        const data = updateProfissionalSchema.parse(req.body);
        const profissional = await ProfissionalRepository.update(req.params.id, data);
        return res.status(200).json({ status: 'success', data: profissional });
    }

    async inativar(req, res) {
        const profissional = await ProfissionalRepository.update(req.params.id, { ativo: false });
        return res.status(200).json({ status: 'success', data: profissional });
    }

    async reativar(req, res) {
        const profissional = await ProfissionalRepository.update(req.params.id, { ativo: true });
        return res.status(200).json({ status: 'success', data: profissional });
    }

    async delete(req, res) {
        await ProfissionalRepository.softDelete(req.params.id);
        return res.status(204).send();
    }
}

export default new ProfissionalController();