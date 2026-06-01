import AppError from '../errors/AppError.js';

export default function authorizeRole(allowedRoles = []) {
    return (req, res, next) => {
        const { roles } = req.user;

        if (!roles || !Array.isArray(roles)) {
            throw new AppError('Acesso negado: Perfil não identificado.', 403);
        }

        const hasPermission = roles.some(role => allowedRoles.includes(role));

        if (!hasPermission) {
            throw new AppError('Acesso negado: Seus perfis atuais não têm permissão para acessar este recurso.', 403);
        }

        return next();
    };
}