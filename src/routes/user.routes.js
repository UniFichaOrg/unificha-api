import { Router } from 'express';
import UserController from '../controllers/UserController.js';
import ensureAuthenticated from '../middlewares/auth.js';
import authorizeRole from '../middlewares/role.js';

const userRoutes = Router();

// Públicas
userRoutes.post('/', UserController.create);

// Privadas - Todas precisam de autenticação
userRoutes.use(ensureAuthenticated);

const onlyGestores = authorizeRole(['ADMIN', 'ATENDIMENTO']);

userRoutes.get('/', onlyGestores, UserController.index);       // Lista e Busca
userRoutes.get('/:id', onlyGestores, UserController.show);     // Busca por ID
userRoutes.put('/:id', onlyGestores, UserController.update);   // Atualiza
userRoutes.delete('/:id', onlyGestores, UserController.delete);// Soft Delete

export default userRoutes;