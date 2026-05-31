import FichaRepository from '../../repositories/FichaRepository.js';
import AgendaRepository from '../../repositories/AgendaRepository.js';
import UserRepository from '../../repositories/UsuarioRepository.js';
import AppError from '../../errors/AppError.js';

class CreateFichaService {
    async execute({ idUsuario, idConfiguracaoAgenda, dataAtendimento, tipo, justificativa, ipCliente }) {
        const usuario = await UserRepository.findById(idUsuario);
        if (!usuario) throw new AppError('Usuário não encontrado.', 404);

        const agenda = await AgendaRepository.findById(idConfiguracaoAgenda);
        if (!agenda) throw new AppError('Agenda não encontrada.', 404);

        // ─── RN-05: POLÍTICA DE TERRITORIALIZAÇÃO SEMÂNTICA ───
        if (agenda.ubs.politicaAtendimento === 'MUNICIPAL') {
            if (agenda.ubs.municipio.toLowerCase().trim() !== usuario.municipio.toLowerCase().trim()) {
                throw new AppError(`Acesso negado: Esta UBS atende apenas residentes do município de ${agenda.ubs.municipio}.`, 403);
            }
        } else if (agenda.ubs.politicaAtendimento === 'ESTADUAL') {
            if (agenda.ubs.uf.toLowerCase().trim() !== usuario.uf.toLowerCase().trim()) {
                throw new AppError(`Acesso negado: Esta UBS atende apenas residentes do estado de ${agenda.ubs.uf}.`, 403);
            }
        } // Se for FEDERAL, ignora as validações geográficas automaticamente.

        const targetDate = new Date(dataAtendimento);
        const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999));

        // ─── RN-04: LIMITE DINÂMICO DE FICHAS POR CIDADÃO ───
        const fichasDoCidadaoNoDia = await prisma.ficha.count({
            where: {
                idUsuario,
                deletadoEm: null,
                status: { not: 'CANCELADA' },
                dataAtendimento: { gte: startOfDay, lte: endOfDay }
            }
        });

        if (fichasDoCidadaoNoDia >= agenda.limiteFichasPorCidadao) {
            throw new AppError(`Bloqueio Anti-Cambismo: Você atingiu o limite máximo de ${agenda.limiteFichasPorCidadao} agendamentos para este dia nesta UBS.`, 409);
        }

        // Validação de Capacidade/Cotas da Especialidade
        const totalEmitidas = await FichaRepository.countEmitidasByAgendaAndDate(idConfiguracaoAgenda, tipo, startOfDay, endOfDay);
        const limiteCota = tipo === 'PRIORITARIA' ? agenda.cotaPrioritaria : agenda.cotaGeral;

        if (totalEmitidas >= limiteCota) {
            throw new AppError(`As cotas para atendimento do tipo ${tipo} estão esgotadas nesta data.`, 409);
        }

        return await FichaRepository.create({
            idUsuario,
            idConfiguracaoAgenda,
            dataAtendimento: new Date(dataAtendimento),
            tipo,
            justificativa,
            status: 'PENDENTE',
            auditoriaIdMaquina: usuario.idMaquina,
            auditoriaIp: ipCliente,
        });
    }
}

export default new CreateFichaService();