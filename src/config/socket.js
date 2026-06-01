import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import authConfig from './auth.js';

let io;

export const setupWebSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Acesso negado: Token ausente'));
        }

        jwt.verify(token, authConfig.jwt.secret, (err, decoded) => {
            if (err) return next(new Error('Acesso negado: Token inválido'));
            socket.user = decoded;
            next();
        });
    });

    io.on('connection', (socket) => {
        console.log(`[WS] Usuário Autenticado conectado: ${socket.user.subject}`);

        socket.on('join-ubs-room', (idUbs) => {
            socket.join(`ubs-${idUbs}`);
            console.log(`[WS] Usuário ingressou no canal da UBS: ${idUbs}`);
        });

        socket.on('disconnect', () => {
            console.log(`[WS] Conexão encerrada: ${socket.id}`);
        });
    });

    return io;
};
export const getIO = () => {
    if (!io) throw new Error("Socket.io não foi inicializado!");
    return io;
};