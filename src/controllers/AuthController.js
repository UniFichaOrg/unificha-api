import { authSchema, requestPasswordResetSchema, resetPasswordSchema, changePasswordSchema, updateMachineIdSchema } from '../validators/auth.validator.js';
import AuthenticateUserService from '../services/usuarios/AuthenticateUsuarioService.js';
import RequestPasswordResetService from '../services/usuarios/RequestPasswordResetService.js';
import ResetPasswordService from '../services/usuarios/ResetPasswordService.js';
import ChangePasswordService from '../services/usuarios/ChangePasswordService.js';
import UpdateMachineIdService from '../services/usuarios/UpdateMachineIdService.js';
import UserRepository from '../repositories/UsuarioRepository.js';
import UsuarioDTO from '../dtos/UsuarioDTO.js';

class AuthController {
    async login(req, res) {
        const validatedData = authSchema.parse(req.body);
        const { user, token } = await AuthenticateUserService.execute(validatedData);
        return res.status(200).json({
            status: 'success',
            data: { user: UsuarioDTO.toResponse(user), token },
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
        return res.status(200).json({ status: 'success', data: UsuarioDTO.toResponse(user) });
    }

    async forgotPassword(req, res) {
        const { email } = requestPasswordResetSchema.parse(req.body);
        await RequestPasswordResetService.execute({ email });
        return res.status(200).json({
            status: 'success',
            message: 'Se este e-mail estiver cadastrado, você receberá um link de recuperação em breve.',
        });
    }

    async resetPassword(req, res) {
        const data = resetPasswordSchema.parse(req.body);
        await ResetPasswordService.execute(data);
        return res.status(200).json({ status: 'success', message: 'Senha redefinida com sucesso. Faça login novamente.' });
    }

    async changePassword(req, res) {
        const data = changePasswordSchema.parse(req.body);
        await ChangePasswordService.execute({ userId: req.user.id, ...data });
        return res.status(200).json({ status: 'success', message: 'Senha alterada com sucesso.' });
    }

    async updateDevice(req, res) {
        const data = updateMachineIdSchema.parse(req.body);
        await UpdateMachineIdService.execute({ userId: req.user.id, ...data });
        return res.status(200).json({ status: 'success', message: 'Novo dispositivo registrado com sucesso.' });
    }
}

export default new AuthController();
