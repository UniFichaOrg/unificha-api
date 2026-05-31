import AgendaRepository from '../../repositories/AgendaRepository.js';
import AppError from '../../errors/AppError.js';

class UpdateAgendaService {
    async execute(id, data, requestingUser) {
        const agenda = await AgendaRepository.findById(id);
        if (!agenda) throw new AppError('Configuração de agenda não encontrada.', 404);

        if (requestingUser.role === 'GESTOR' && agenda.ubs.idGestor !== requestingUser.id) {
            throw new AppError('Acesso negado: você só pode editar agendas da sua UBS.', 403);
        }

        if (data.horarioAbertura && data.horarioFechamento) {
            if (data.horarioAbertura >= data.horarioFechamento) {
                throw new AppError('O horário de abertura deve ser anterior ao horário de fechamento.', 422);
            }
        }

        return await AgendaRepository.update(id, data);
    }
}
export default new UpdateAgendaService();