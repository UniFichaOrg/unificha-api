import prisma from '../config/prisma.js';

class UserRepository {
  async findByLogin(login) {
    return await prisma.usuario.findFirst({
      where: { login, deletadoEm: null },
    });
  }

  async findByCpfOrCns(cpf, cns) {
    return await prisma.usuario.findFirst({
      where: {
        OR: [
          { cpf },
          { cns },
        ],
        deletadoEm: null,
      },
    });
  }

  async findById(id) {
    return await prisma.usuario.findFirst({
      where: { id, deletadoEm: null },
    });
  }

  async findManyActive() {
    return await prisma.usuario.findMany({
      where: { deletadoEm: null },
    });
  }

  async search(query) {
    return await prisma.usuario.findMany({
      where: {
        deletadoEm: null,
        OR: [
          { nomeCompleto: { contains: query, mode: 'insensitive' } },
          { cpf: { contains: query } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }

  async create(userData) {
    return await prisma.usuario.create({
      data: userData,
    });
  }

  async update(id, data) {
    return await prisma.usuario.update({
      where: { id },
      data: { ...data, atualizadoEm: new Date() },
    });
  }

  async softDelete(id) {
    return await prisma.usuario.update({
      where: { id },
      data: { deletadoEm: new Date() },
    });
  }
}

export default new UserRepository();