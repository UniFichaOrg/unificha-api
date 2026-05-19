import { authSchema } from '../validators/auth.validator.js';
import AuthenticateUserService from '../services/users/AuthenticateUserService.js';
import UserRepository from '../repositories/UserRepository.js';
import UserDTO from '../dtos/UserDTO.js';

class AuthController {
  async login(req, res) {
    const validatedData = authSchema.parse(req.body);
    const { user, token } = await AuthenticateUserService.execute(validatedData);

    return res.status(200).json({
      status: 'success',
      data: { user: UserDTO.toResponse(user), token },
    });
  }

  async logout(req, res) {
    return res.status(200).json({ status: 'success', message: 'Logout realizado com sucesso.' });
  }

  async validateToken(req, res) {
    return res.status(200).json({ status: 'success', valid: true });
  }

  async me(req, res) {
    const user = await UserRepository.findById(req.user.id);
    return res.status(200).json({ status: 'success', data: UserDTO.toResponse(user) });
  }
}

export default new AuthController();