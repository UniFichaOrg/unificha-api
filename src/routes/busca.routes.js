import { Router } from 'express';
import BuscaController from '../controllers/BuscaController.js';
import ensureAuthenticated from '../middlewares/auth.js';
import authorizeRole from '../middlewares/role.js';

const buscaRoutes = Router();

buscaRoutes.get('/', ensureAuthenticated, authorizeRole(['ADMIN', 'GESTOR']), BuscaController.executar);

export default buscaRoutes;