import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.js';
import AppError from '../errors/AppError.js';

export default function ensureAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token JWT não fornecido.', 401);
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, authConfig.jwt.secret);

    req.user = {
      id: decoded.sub,
      role: decoded.role,
      machine_id: decoded.machine_id,
    };

    const clientMachineId = req.headers['x-machine-id'];
    if (clientMachineId && clientMachineId !== req.user.machine_id) {
      throw new AppError('Assinatura de dispositivo inválida. Risco de clonagem de token.', 401);
    }

    return next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Token JWT inválido ou expirado.', 401);
  }
}