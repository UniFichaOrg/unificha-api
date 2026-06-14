import { Router } from 'express';
import FilaController from '../controllers/FilaController.js';
import ensureAuthenticated from '../middlewares/auth.js';
import authorizeRole from '../middlewares/role.js';

const filaRoutes = Router();

filaRoutes.get('/', ensureAuthenticated, authorizeRole(['ADMIN', 'GESTOR', 'AGENTE']), FilaController.index);

export default filaRoutes;