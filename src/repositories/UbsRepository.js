import prisma from '../config/prisma.js';

class UbsRepository {
    async create(data) {
        return await prisma.ubs.create({ data });
    }

    async findById(id) {
        return await prisma.ubs.findFirst({ where: { id, deletadoEm: null } });
    }

    async findManyActive(query = '') {
        return await prisma.ubs.findMany({
            where: {
                deletadoEm: null,
                OR: [
                    { nome: { contains: query, mode: 'insensitive' } },
                    { municipio: { contains: query, mode: 'insensitive' } },
                ]
            },
        });
    }

    async update(id, data) {
        return await prisma.ubs.update({
            where: { id },
            data: { ...data, atualizadoEm: new Date() },
        });
    }

    async softDelete(id) {
        return await prisma.ubs.update({
            where: { id },
            data: { deletadoEm: new Date() },
        });
    }

    async hardDelete(id) {
        return await prisma.ubs.delete({ where: { id } });
    }

    async findByNomeAndMunicipio(nome, municipio) {
        return await prisma.ubs.findFirst({
            where: { nome, municipio, deletadoEm: null },
        });
    }
}

export default new UbsRepository();