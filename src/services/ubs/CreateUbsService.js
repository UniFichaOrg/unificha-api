import UbsRepository from '../../repositories/UbsRepository.js';
import AppError from '../../errors/AppError.js';

class CreateUbsService {
    async execute(data) {
        const nomeExists = await UbsRepository.findByNomeAndMunicipio(data.nome, data.municipio);
        if (nomeExists) {
            throw new AppError('Já existe uma UBS com este nome neste município.', 409);
        }
        return await UbsRepository.create(data);
    }
}
export default new CreateUbsService();