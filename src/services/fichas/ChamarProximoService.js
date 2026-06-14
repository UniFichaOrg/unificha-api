import prisma from '../../config/prisma.js';
import AppError from '../../errors/AppError.js';
import { getIO } from '../../config/socket.js';

class ChamarProximoService {
    async execute({ idConfiguracaoAgenda, data }) {
        const targetDate = data ? new Date(data) : new Date();
        const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999));

        const agenda = await prisma.configuracaoAgenda.findUnique({
            where: { id: idConfiguracaoAgenda },
            include: { ubs: true }
        });

        if (!agenda) throw new AppError('Agenda não encontrada.', 404);
        if (agenda.ubs.filaPausada) throw new AppError(`A fila desta UBS está pausada. Motivo: ${agenda.ubs.filaMotivoPausa}`, 403);

        // 1. Busca todos os pendentes do dia para esta agenda
        const pendentes = await prisma.ficha.findMany({
            where: {
                idConfiguracaoAgenda,
                status: 'PENDENTE',
                deletadoEm: null,
                dataAtendimento: { gte: startOfDay, lte: endOfDay }
            },
            orderBy: { criadoEm: 'asc' },
            include: { usuario: true }
        });

        if (pendentes.length === 0) {
            throw new AppError('Não há pacientes aguardando na fila para esta agenda.', 404);
        }

        // 2. Regra de Negócio: Prioriza 'PRIORITARIA' antes de 'NORMAL'
        let fichaEscolhida = pendentes.find(f => f.tipo === 'PRIORITARIA');
        if (!fichaEscolhida) {
            fichaEscolhida = pendentes.find(f => f.tipo === 'NORMAL');
        }

        // 3. Atualiza o status
        const fichaChamada = await prisma.ficha.update({
            where: { id: fichaEscolhida.id },
            data: {
                status: 'CHAMADA',
                atualizadoEm: new Date()
            },
            include: { usuario: true }
        });

        // 4. Identifica quem é o próximo (para o frontend mostrar "Próximo: João")
        const restantes = pendentes.filter(f => f.id !== fichaChamada.id);
        let proximaFicha = restantes.find(f => f.tipo === 'PRIORITARIA') || restantes.find(f => f.tipo === 'NORMAL') || null;

        // 5. Emite evento via WebSocket para o painel da UBS
        const io = getIO();
        io.to(`ubs-${agenda.idUbs}`).emit('fila:proximo-chamado', {
            fichaChamada: {
                id: fichaChamada.id,
                tipo: fichaChamada.tipo,
                paciente: { nomeCompleto: fichaChamada.usuario.nomeCompleto, cpf: fichaChamada.usuario.cpf }
            },
            proximaFicha: proximaFicha ? {
                id: proximaFicha.id,
                tipo: proximaFicha.tipo,
                paciente: { nomeCompleto: proximaFicha.usuario.nomeCompleto }
            } : null
        });

        return { fichaChamada, proximaFicha };
    }
}

export default new ChamarProximoService();