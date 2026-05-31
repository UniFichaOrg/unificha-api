import AgendaRepository from '../../repositories/AgendaRepository.js';
import UbsRepository from '../../repositories/UbsRepository.js';
import AppError from '../../errors/AppError.js';

class CreateAgendaService {
    async execute(data, requestingUser) {
        const ubs = await UbsRepository.findById(data.idUbs);
        if (!ubs) throw new AppError('UBS não encontrada.', 404);

        if (requestingUser.role === 'GESTOR' && ubs.idGestor !== requestingUser.id) {
            throw new AppError('Acesso negado: você só pode criar agendas para a sua UBS.', 403);
        }

        const conflito = await AgendaRepository.findConflict(data.idUbs, data.especialidade, data.horarioAbertura, data.horarioFechamento);
        if (conflito) {
            throw new AppError('Já existe uma agenda ativa para esta especialidade neste horário nesta UBS.', 409);
        }

        if (data.horarioAbertura >= data.horarioFechamento) {
            throw new AppError('O horário de abertura deve ser anterior ao horário de fechamento.', 422);
        }

        return await AgendaRepository.create(data);
    }
}
export default new CreateAgendaService();