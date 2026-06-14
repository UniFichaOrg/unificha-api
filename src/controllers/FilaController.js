import prisma from '../config/prisma.js';
import FichaDTO from '../dtos/FichaDTO.js';
import AppError from '../errors/AppError.js';

class FilaController {
    async index(req, res) {
        const { idUbs, especialidade, status, tipo, data } = req.query;
        const { role, id: userId } = req.user;

        if ((role === 'GESTOR' || role === 'AGENTE') && !idUbs) {
            throw new AppError('Acesso negado: Profissionais de saúde precisam informar o ID da UBS.', 403);
        }

        const targetDate = data ? new Date(data) : new Date();
        const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999));

        const fichas = await prisma.ficha.findMany({
            where: {
                deletadoEm: null,
                dataAtendimento: { gte: startOfDay, lte: endOfDay },
                ...(status && { status }),
                ...(tipo && { tipo }),
                ...(idUbs && { configuracaoAgenda: { idUbs } }),
                ...(especialidade && { configuracaoAgenda: { especialidade: { contains: especialidade, mode: 'insensitive' } } })
            },
            include: {
                usuario: true,
                configuracaoAgenda: { include: { ubs: true } }
            },
            orderBy: [
                { tipo: 'desc' },
                { criadoEm: 'asc' }
            ]
        });

        const resultado = fichas.map((ficha, index) => ({
            id: ficha.id,
            numero: index + 1,
            tipo: ficha.tipo,
            status: ficha.status,
            dataAtendimento: ficha.dataAtendimento,
            especialidade: ficha.configuracaoAgenda.especialidade,
            paciente: {
                id: ficha.usuario.id,
                nomeCompleto: ficha.usuario.nomeCompleto,
                cpf: ficha.usuario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"),
                municipio: ficha.usuario.municipio
            }
        }));

        return res.status(200).json({ status: 'success', data: resultado });
    }
}

export default new FilaController();