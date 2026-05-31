import prisma from '../config/prisma.js';

class FichaRepository {
    async create(data) {
        return await prisma.ficha.create({ data });
    }

    async findActiveByUserAndDate(idUsuario, startOfDay, endOfDay) {
        return await prisma.ficha.findFirst({
            where: {
                idUsuario,
                deletadoEm: null,
                status: { not: 'CANCELADA' },
                dataAtendimento: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });
    }

    async countEmitidasByAgendaAndDate(idConfiguracaoAgenda, tipo, startOfDay, endOfDay) {
        return await prisma.ficha.count({
            where: {
                idConfiguracaoAgenda,
                tipo,
                deletadoEm: null,
                status: { not: 'CANCELADA' },
                dataAtendimento: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });
    }

    async findManyByUser(idUsuario) {
        return await prisma.ficha.findMany({
            where: { idUsuario, deletadoEm: null },
            include: {
                configuracaoAgenda: {
                    include: { ubs: true }
                }
            },
            orderBy: { dataAtendimento: 'desc' }
        });
    }

    async findById(id) {
        return await prisma.ficha.findFirst({
            where: { id, deletadoEm: null },
            include: { configuracaoAgenda: { include: { ubs: true } }, usuario: true },
        });
    }

    async findManyFiltered({ status, data, idUbs } = {}) {
        return await prisma.ficha.findMany({
            where: {
                deletadoEm: null,
                ...(status && { status }),
                ...(data && {
                    dataAtendimento: {
                        gte: new Date(new Date(data).setUTCHours(0,0,0,0)),
                        lte: new Date(new Date(data).setUTCHours(23,59,59,999)),
                    },
                }),
                ...(idUbs && { configuracaoAgenda: { idUbs } }),
            },
            include: { configuracaoAgenda: { include: { ubs: true } }, usuario: true },
            orderBy: { dataAtendimento: 'asc' },
        });
    }
}

export default new FichaRepository();