import AppError from '../errors/AppError.js';
import { ZodError } from 'zod';
import pino from 'pino';
import { Prisma } from '@prisma/client';

const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: { colorize: true }
    }
});

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

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            const field = err.meta?.target?.[0] || 'campo';
            return res.status(409).json({
                status: 'error',
                message: `Conflito de dados: Já existe um registro ativo utilizando este ${field}.`,
            });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                status: 'error',
                message: 'O registro solicitado não foi encontrado no banco de dados.',
            });
        }
    }

    logger.error({
        message: err.message,
        stack: err.stack,
        route: req.originalUrl,
        method: req.method
    });

    return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
}