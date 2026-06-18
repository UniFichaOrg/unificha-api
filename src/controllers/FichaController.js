import CreateFichaService from '../services/fichas/CreateFichaService.js';
import ChamarProximoService from '../services/fichas/ChamarProximoService.js';
import FichaRepository from '../repositories/FichaRepository.js';
import FichaDTO from '../dtos/FichaDTO.js';
import { createFichaSchema, updateFichaStatusSchema, chamarProximoSchema } from '../validators/ficha.validator.js';
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
        const { id: userId, roles = [] } = req.user;
        const isCidadao = roles.includes('CIDADAO');

        let fichas;

        if (isCidadao) {
            fichas = await FichaRepository.findManyByUser(userId);
        } else {
            fichas = await FichaRepository.findManyFiltered({ status, data, idUbs });
        }

        return res.status(200).json({ status: 'success', data: FichaDTO.toResponseArray(fichas) });
    }

    async updateStatus(req, res) {
        const { status } = updateFichaStatusSchema.parse(req.body);
        const ficha = await FichaRepository.findById(req.params.id);
        if (!ficha) throw new AppError('Ficha não encontrada.', 404);

        if (['CONCLUIDA', 'CANCELADA', 'AUSENTE'].includes(ficha.status)) {
            throw new AppError('Esta ficha já foi finalizada e não pode ser alterada.', 422);
        }

        if (req.user.roles?.includes('CIDADAO')) {
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

    async chamarProximo(req, res) {
        const data = chamarProximoSchema.parse(req.body);
        const resultado = await ChamarProximoService.execute(data);
        return res.status(200).json({ status: 'success', data: resultado });
    }

    async iniciarAtendimento(req, res) {
        const { id } = req.params;
        const ficha = await FichaRepository.findById(id);
        if (!ficha) throw new AppError('Ficha não encontrada.', 404);

        const fichaAtualizada = await prisma.ficha.update({
            where: { id },
            data: {
                status: 'EM_ATENDIMENTO',
                iniciadoEm: new Date(),
                atualizadoEm: new Date()
            },
            include: { usuario: true }
        });

        return res.status(200).json({
            status: 'success',
            data: {
                id: fichaAtualizada.id,
                status: fichaAtualizada.status,
                iniciadoEm: fichaAtualizada.iniciadoEm,
                paciente: {
                    id: fichaAtualizada.usuario.id,
                    nomeCompleto: fichaAtualizada.usuario.nomeCompleto,
                    cpf: fichaAtualizada.usuario.cpf,
                    cns: fichaAtualizada.usuario.cns
                }
            }
        });
    }

    async finalizarAtendimento(req, res) {
        const { id } = req.params;
        const { observacao } = req.body;

        const ficha = await FichaRepository.findById(id);
        if (!ficha) throw new AppError('Ficha não encontrada.', 404);

        const fichaAtualizada = await prisma.ficha.update({
            where: { id },
            data: {
                status: 'CONCLUIDA',
                finalizadoEm: new Date(),
                observacao,
                atualizadoEm: new Date()
            }
        });

        return res.status(200).json({ status: 'success', data: FichaDTO.toResponse(fichaAtualizada) });
    }

    async hojeCidadao(req, res) {
        const startOfDay = new Date(new Date().setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date().setUTCHours(23, 59, 59, 999));

        const fichas = await prisma.ficha.findMany({
            where: {
                idUsuario: req.user.id,
                deletadoEm: null,
                dataAtendimento: { gte: startOfDay, lte: endOfDay }
            },
            include: { configuracaoAgenda: { include: { ubs: true } } },
            orderBy: { dataAtendimento: 'asc' }
        });

        const agora = new Date();

        const fichasComBadge = fichas.map(ficha => {
            const minutosFaltando = Math.round((new Date(ficha.dataAtendimento) - agora) / 60000);
            let badge = 'NORMAL';
            let label = '';

            if (ficha.status !== 'PENDENTE' && ficha.status !== 'CHAMADA') {
                badge = 'AGUARDANDO';
                label = ficha.status;
            } else if (ficha.status === 'CHAMADA') {
                badge = 'AGORA';
                label = 'Chamado no Painel';
            } else if (minutosFaltando <= 0) {
                badge = 'AGORA';
                label = 'Agora';
            } else if (minutosFaltando <= 60) {
                badge = 'EM_BREVE';
                label = `Em ${minutosFaltando} minutos`;
            } else if (minutosFaltando <= 120) {
                badge = 'ATENCAO';
                label = `Em ${Math.round(minutosFaltando / 60)} horas`;
            } else {
                label = `Hoje às ${new Date(ficha.dataAtendimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
            }

            return {
                ...FichaDTO.toResponse(ficha),
                ubs: ficha.configuracaoAgenda.ubs,
                especialidade: ficha.configuracaoAgenda.especialidade,
                proximidade: { minutosFaltando, badge, label }
            };
        });

        return res.status(200).json({ status: 'success', data: fichasComBadge });
    }

    async me(req, res) {
        const fichas = await FichaRepository.findManyByUser(req.user.id);
        return res.status(200).json({ status: 'success', data: FichaDTO.toResponseArray(fichas) });
    }

    async show(req, res) {
        const ficha = await FichaRepository.findById(req.params.id);
        if (!ficha) throw new AppError('Ficha não encontrada.', 404);

        if (req.user.roles?.includes('CIDADAO') && ficha.idUsuario !== req.user.id) {
            throw new AppError('Acesso negado: Você não possui permissão para ver esta ficha.', 403);
        }

        return res.status(200).json({ status: 'success', data: FichaDTO.toResponse(ficha) });
    }

    async delete(req, res) {
        const { id } = req.params;
        await FichaRepository.delete(id);
        return res.status(204).send();
    }

    async forceDelete(req, res) {
        const { id } = req.params;
        await FichaRepository.forceDelete(id);
        return res.status(204).send();
    }
}

export default new FichaController();