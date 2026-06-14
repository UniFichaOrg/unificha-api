import prisma from '../config/prisma.js';

class ProfissionalRepository {
    async create({ idUbs, ...data }) {
        return await prisma.profissional.create({
            data: {
                ...data,
                ubs: {
                    create: idUbs.map(id => ({ idUbs: id }))
                }
            },
            include: { ubs: { include: { ubs: true } } }
        });
    }

    async findMany(filters = {}) {
        const { especialidade, area, idUbs, ativo, q } = filters;

        return await prisma.profissional.findMany({
            where: {
                deletadoEm: null,
                ...(ativo !== undefined && { ativo: ativo === 'true' }),
                ...(especialidade && { especialidade: { contains: especialidade, mode: 'insensitive' } }),
                ...(area && { area: { contains: area, mode: 'insensitive' } }),
                ...(q && { nome: { contains: q, mode: 'insensitive' } }),
                ...(idUbs && { ubs: { some: { idUbs } } })
            },
            include: { ubs: { include: { ubs: true } } }
        });
    }

    async findById(id) {
        return await prisma.profissional.findFirst({
            where: { id, deletadoEm: null },
            include: { ubs: { include: { ubs: true } } }
        });
    }

    async update(id, data) {
        return await prisma.profissional.update({
            where: { id },
            data: { ...data, atualizadoEm: new Date() },
            include: { ubs: { include: { ubs: true } } }
        });
    }

    async softDelete(id) {
        return await prisma.profissional.update({
            where: { id },
            data: { deletadoEm: new Date(), ativo: false }
        });
    }
}

export default new ProfissionalRepository();