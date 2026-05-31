import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserRepository from '../../repositories/UsuarioRepository.js';
import AppError from '../../errors/AppError.js';
import authConfig from '../../config/auth.js';

class AuthenticateUsuarioService {
  async execute({ login, senha, idMaquina }) {
    const user = await UserRepository.findByLoginOrCpf(login);

    if (!user || !user.senhaHash) {
      throw new AppError('Credenciais incorretas.', 401);
    }

    const passwordMatched = await bcrypt.compare(senha, user.senhaHash);
    if (!passwordMatched) {
      throw new AppError('Credenciais incorretas.', 401);
    }

    const { secret, expiresIn } = authConfig.jwt;
    const token = jwt.sign(
      {
        role: user.perfil,
        machine_id: idMaquina || user.idMaquina,
      },
      secret,
      {
        subject: user.id,
        expiresIn,
      }
    );

    return { user, token };
  }
}

export default new AuthenticateUsuarioService();