import prisma from '../config/prisma.js';
import AppError from '../errors/AppError.js';
import FichaDTO from '../dtos/FichaDTO.js';

class DashboardController {
    async cidadao(req, res) {
        const userId = req.user.id;
        const startOfDay = new Date(new Date().setUTCHours(0, 0, 0, 0));

        const [fichasAgrupadas, proximasConsultas, historicoRecente] = await Promise.all([
            prisma.ficha.groupBy({
                by: ['status'],
                where: { idUsuario: userId, deletadoEm: null },
                _count: { status: true }
            }),
            prisma.ficha.findMany({
                where: {
                    idUsuario: userId,
                    deletadoEm: null,
                    status: 'PENDENTE',
                    dataAtendimento: { gte: startOfDay }
                },
                include: { configuracaoAgenda: { include: { ubs: true } } },
                orderBy: { dataAtendimento: 'asc' },
                take: 5
            }),
            prisma.ficha.findMany({
                where: { idUsuario: userId, deletadoEm: null, status: { in: ['CONCLUIDA', 'CANCELADA', 'AUSENTE'] } },
                include: { configuracaoAgenda: { include: { ubs: true } } },
                orderBy: { dataAtendimento: 'desc' },
                take: 5
            })
        ]);

        const contagem = fichasAgrupadas.reduce((acc, curr) => {
            acc[curr.status] = curr._count.status;
            return acc;
        }, { PENDENTE: 0, CONCLUIDA: 0, CANCELADA: 0, EM_ATENDIMENTO: 0, CHAMADA: 0, AUSENTE: 0 });

        const totalFichas = Object.values(contagem).reduce((a, b) => a + b, 0);

        return res.status(200).json({
            status: 'success',
            data: {
                fichasHoje: FichaDTO.toResponseArray(proximasConsultas.filter(f => f.dataAtendimento.toDateString() === new Date().toDateString())),
                fichasConfirmadas: contagem.CONCLUIDA,
                fichasPendentes: contagem.PENDENTE,
                fichasCanceladas: contagem.CANCELADA,
                proximasConsultas: FichaDTO.toResponseArray(proximasConsultas),
                historicoRecente: FichaDTO.toResponseArray(historicoRecente),
                totalFichas
            }
        });
    }

    async admin(req, res) {
        const { idUbs } = req.query;
        const startOfDay = new Date(new Date().setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date().setUTCHours(23, 59, 59, 999));

        const agendaFilter = idUbs ? { configuracaoAgenda: { idUbs } } : {};

        const [totalUsuarios, totalUbs, totalFichasAtivas, fichasHojeStatus] = await Promise.all([
            prisma.usuario.count({ where: { deletadoEm: null } }),
            prisma.ubs.count({ where: { deletadoEm: null } }),
            prisma.ficha.count({ where: { status: 'PENDENTE', deletadoEm: null } }),
            prisma.ficha.groupBy({
                by: ['status'],
                where: { deletadoEm: null, dataAtendimento: { gte: startOfDay, lte: endOfDay }, ...agendaFilter },
                _count: { status: true }
            })
        ]);

        const cardsHoje = fichasHojeStatus.reduce((acc, curr) => {
            acc[curr.status] = curr._count.status;
            return acc;
        }, { PENDENTE: 0, CONCLUIDA: 0, CANCELADA: 0, EM_ATENDIMENTO: 0, CHAMADA: 0, AUSENTE: 0 });

        const totalFichasHoje = Object.values(cardsHoje).reduce((a, b) => a + b, 0);

        // Resumo básico da fila do turno
        const filaDia = {
            totalFichas: totalFichasHoje,
            atendidas: cardsHoje.CONCLUIDA,
            emEspera: cardsHoje.PENDENTE + cardsHoje.CHAMADA,
            canceladas: cardsHoje.CANCELADA,
            pausada: false
        };

        return res.status(200).json({
            status: 'success',
            data: {
                cards: {
                    fichasHoje: totalFichasHoje,
                    fichasConfirmadas: cardsHoje.CONCLUIDA,
                    fichasPendentes: cardsHoje.PENDENTE,
                    fichasCanceladas: cardsHoje.CANCELADA
                },
                estatisticas: {
                    totalUsuarios,
                    totalUbs,
                    totalFichasAtivas
                },
                filaDia
            }
        });
    }

    async atendendoAgora(req, res) {
        const { idConfiguracaoAgenda } = req.query;
        if (!idConfiguracaoAgenda) {
            throw new AppError('O ID da configuração da agenda é obrigatório para monitorar a fila.', 400);
        }

        const startOfDay = new Date(new Date().setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date().setUTCHours(23, 59, 59, 999));

        const [fichaAtual, proximaFicha, totalRestantes] = await Promise.all([
            prisma.ficha.findFirst({
                where: { idConfiguracaoAgenda, status: 'EM_ATENDIMENTO', deletadoEm: null },
                include: { usuario: true }
            }),
            prisma.ficha.findFirst({
                where: { idConfiguracaoAgenda, status: 'PENDENTE', deletadoEm: null, dataAtendimento: { gte: startOfDay, lte: endOfDay } },
                orderBy: [ { tipo: 'desc' }, { criadoEm: 'asc' } ],
                include: { usuario: true }
            }),
            prisma.ficha.count({
                where: { idConfiguracaoAgenda, status: 'PENDENTE', deletadoEm: null, dataAtendimento: { gte: startOfDay, lte: endOfDay } }
            })
        ]);

        return res.status(200).json({
            status: 'success',
            data: {
                fichaAtual: fichaAtual ? {
                    id: fichaAtual.id,
                    numero: fichaAtual.id.substring(0, 4).toUpperCase(),
                    tipo: fichaAtual.tipo,
                    status: fichaAtual.status,
                    iniciadoEm: fichaAtual.iniciadoEm,
                    paciente: {
                        id: fichaAtual.usuario.id,
                        nomeCompleto: fichaAtual.usuario.nomeCompleto,
                        cpf: fichaAtual.usuario.cpf,
                        cns: fichaAtual.usuario.cns,
                        municipio: fichaAtual.usuario.municipio,
                        bairro: fichaAtual.usuario.bairro
                    }
                } : null,
                proximaFicha: proximaFicha ? {
                    id: proximaFicha.id,
                    tipo: proximaFicha.tipo,
                    paciente: { nomeCompleto: proximaFicha.usuario.nomeCompleto }
                } : null,
                totalRestantes
            }
        });
    }
}

export default new DashboardController();