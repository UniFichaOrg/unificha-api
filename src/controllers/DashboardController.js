import prisma from '../config/prisma.js';
import FichaDTO from '../dtos/FichaDTO.js';

class DashboardController {
    async show(req, res) {
        const { id: userId, role } = req.user;

        let dashboardData = {};

        if (role === 'CIDADAO') {
            const [fichasAtivas, historicoRecente] = await Promise.all([
                prisma.ficha.findMany({
                    where: { idUsuario: userId, status: { in: ['PENDENTE', 'EM_ATENDIMENTO'] }, deletadoEm: null },
                    include: { ubs: true, agenda: true }
                }),
                prisma.ficha.findMany({
                    where: { idUsuario: userId, status: { in: ['CONCLUIDA', 'CANCELADA'] }, deletadoEm: null },
                    take: 5,
                    orderBy: { criadoEm: 'desc' },
                    include: { ubs: true }
                })
            ]);

            dashboardData = {
                fichasAtivas: FichaDTO.toResponseArray(fichasAtivas),
                historicoRecente: FichaDTO.toResponseArray(historicoRecente),
                totalFichas: await prisma.ficha.count({ where: { idUsuario: userId, deletadoEm: null } })
            };
        } else {
            const [totalUsuarios, totalUbs, fichasHoje] = await Promise.all([
                prisma.usuario.count({ where: { deletadoEm: null } }),
                prisma.ubs.count({ where: { deletadoEm: null } }),
                prisma.ficha.count({
                    where: {
                        criadoEm: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
                        deletadoEm: null
                    }
                })
            ]);

            dashboardData = {
                estatisticas: {
                    totalUsuarios,
                    totalUbs,
                    fichasHoje
                }
            };
        }

        return res.status(200).json({ status: 'success', data: dashboardData });
    }
}

export default new DashboardController();