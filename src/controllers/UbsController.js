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

    async proximas(req, res) {
        const municipioUsuario = req.query.municipio || req.user.municipio || '';
        const ufUsuario = req.query.uf || req.user.uf || '';

        const list = await prisma.ubs.findMany({
            where: {
                deletadoEm: null,
                municipio: { contains: municipioUsuario, mode: 'insensitive' },
            },
            orderBy: {
                politicaAtendimento: 'asc'
            }
        });

        const formatted = list.map(ubs => {
            const lat = ubs.latitude ? ubs.latitude.toString() : '0';
            const lng = ubs.longitude ? ubs.longitude.toString() : '0';

            return {
                ...UbsDTO.toResponse(ubs),
                especialidadesAtivas: ["Clínica Geral", "Odontologia"], // Mock de especialidades vinculadas
                linkMaps: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
            };
        });

        return res.status(200).json({ status: 'success', data: formatted });
    }

    async agendasAtivas(req, res) {
        const { id } = req.params;
        const targetDate = req.query.data ? new Date(req.query.data) : new Date();
        const startOfDay = new Date(targetDate.setUTCHours(0,0,0,0));
        const endOfDay = new Date(targetDate.setUTCHours(23,59,59,999));

        const agendas = await prisma.configuracaoAgenda.findMany({
            where: { idUbs: id, deletadoEm: null },
            include: {
                fichas: {
                    where: { deletadoEm: null, dataAtendimento: { gte: startOfDay, lte: endOfDay } }
                }
            }
        });

        const resultado = agendas.map(agenda => {
            const ocupadasGeral = agenda.fichas.filter(f => f.tipo === 'NORMAL' && f.status !== 'CANCELADA').length;
            const ocupadasPrioritaria = agenda.fichas.filter(f => f.tipo === 'PRIORITARIA' && f.status !== 'CANCELADA').length;

            return {
                id: agenda.id,
                especialidade: agenda.especialidade,
                horarioAbertura: agenda.horarioAbertura,
                horarioFechamento: agenda.horarioFechamento,
                vagasGeral: {
                    total: agenda.cotaGeral || 0,
                    ocupadas: ocupadasGeral,
                    disponiveis: Math.max(0, (agenda.cotaGeral || 0) - ocupadasGeral)
                },
                vagasPrioritaria: {
                    total: agenda.cotaPrioritaria || 0,
                    ocupadas: ocupadasPrioritaria,
                    disponiveis: Math.max(0, (agenda.cotaPrioritaria || 0) - ocupadasPrioritaria)
                },
                limiteFichasPorCidadao: agenda.limiteFichasPorCidadao
            };
        });

        return res.status(200).json({ status: 'success', data: resultado });
    }

    async pausarFila(req, res) {
        const { id } = req.params;
        const { pausar, motivo } = req.body;

        const ubsAtualizada = await prisma.ubs.update({
            where: { id },
            data: {
                filaPausada: pausar,
                filaMotivoPausa: pausar ? motivo : null,
                atualizadoEm: new Date()
            }
        });

        const io = (await import('../config/socket.js')).getIO();
        io.to(`ubs-${id}`).emit('fila:pausada', { pausada: pausar, motivo });

        return res.status(200).json({
            status: 'success',
            data: {
                pausada: ubsAtualizada.filaPausada,
                motivo: ubsAtualizada.filaMotivoPausa
            }
        });
    }
}
export default new UbsController();