import prisma from '../config/prisma.js';

class AgendaRepository {
    async create(data) {
        return await prisma.configuracaoAgenda.create({ data });
    }

    async findById(id) {
        return await prisma.configuracaoAgenda.findFirst({
            where: { id, deletadoEm: null },
            include: { ubs: true }
        });
    }

    async findManyActive() {
        return await prisma.configuracaoAgenda.findMany({
            where: { deletadoEm: null },
            include: { ubs: true }
        });
    }

    async update(id, data) {
        return await prisma.configuracaoAgenda.update({
            where: { id },
            data: { ...data, atualizadoEm: new Date() }
        });
    }

    async softDelete(id) {
        return await prisma.configuracaoAgenda.update({
            where: { id },
            data: { deletadoEm: new Date() }
        });
    }

    async hardDelete(id) {
        return await prisma.configuracaoAgenda.delete({ where: { id } });
    }

    async findConflict(idUbs, especialidade, horarioAbertura, horarioFechamento) {
        return await prisma.configuracaoAgenda.findFirst({
            where: {
                idUbs,
                especialidade,
                deletadoEm: null,
                OR: [
                    { horarioAbertura: { lte: horarioFechamento }, horarioFechamento: { gte: horarioAbertura } },
                ],
            },
        });
    }
}

export default new AgendaRepository();