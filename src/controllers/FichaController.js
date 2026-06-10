import CreateFichaService from '../services/fichas/CreateFichaService.js';
import FichaRepository from '../repositories/FichaRepository.js';
import FichaDTO from '../dtos/FichaDTO.js';
import { createFichaSchema, updateFichaStatusSchema } from '../validators/ficha.validator.js';
import AppError from '../errors/AppError.js';
import prisma from '../config/prisma.js';
import { getIO } from '../config/socket.js';

class FichaController {
    async create(req, res) {
        const data = createFichaSchema.parse(req.body);
        const ipCliente = req.ip || req.headers['x-forwarded-for'];

        const ficha = await CreateFichaService.execute({
            idUsuario: req.user.id,
            ...data,
            ipCliente,
        });

        const io = getIO();
        const responseData = FichaDTO.toResponse(ficha);

        const agenda = await prisma.configuracaoAgenda.findUnique({ where: { id: data.idConfiguracaoAgenda } });
        if (agenda) {
            io.to(`ubs-${agenda.idUbs}`).emit('ficha:criada', responseData);

            io.to(`ubs-${agenda.idUbs}`).emit('agenda:vagas-atualizadas', {
                idConfiguracaoAgenda: agenda.id,
                tipo: data.tipo
            });
        }

        return res.status(201).json({ status: 'success', data: responseData });
    }

    async index(req, res) {
        const { status, data, idUbs } = req.query;
        const { id: userId, role } = req.user;

        let fichas;

        if (role === 'CIDADAO') {
            fichas = await FichaRepository.findManyByUser(userId);
        } else if (role === 'AGENTE' || role === 'GESTOR') {
            fichas = await FichaRepository.findManyFiltered({ status, data, idUbs });
        } else {
            fichas = await FichaRepository.findManyFiltered({ status, data, idUbs });
        }

        return res.status(200).json({ status: 'success', data: FichaDTO.toResponseArray(fichas) });
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
            include: { configuracaoAgenda: true }
        });

        const responseData = FichaDTO.toResponse(updated);
        const io = getIO();

        const idUbs = updated.configuracaoAgenda.idUbs;

        io.to(`ubs-${idUbs}`).emit('ficha:atualizada', responseData);

        io.to(`user-${updated.idUsuario}`).emit('minha-ficha:atualizada', responseData);

        return res.status(200).json({ status: 'success', data: responseData });
    }
}

export default new FichaController();