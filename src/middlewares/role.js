import AppError from '../errors/AppError.js';

export default function authorizeRole(allowedRoles = []) {
  return (req, res, next) => {
    const { role } = req.user;

    if (!role || !allowedRoles.includes(role)) {
      throw new AppError('Acesso negado: Seu perfil não tem permissão para acessar este recurso.', 403);
    }

    return next();
  };
}