import AppError from '../errors/AppError.js';
import { ZodError } from 'zod';

export default function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ status: 'error', message: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'validation_error',
      errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
    });
  }

  console.error(err);
  return res.status(500).json({ status: 'error', message: 'Internal server error' });
}