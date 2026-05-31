import { Router } from 'express';
import FichaController from '../controllers/FichaController.js';
import ensureAuthenticated from '../middlewares/auth.js';
import authorizeRole from '../middlewares/role.js';

const fichaRoutes = Router();
fichaRoutes.use(ensureAuthenticated);

fichaRoutes.post('/', FichaController.create);
fichaRoutes.get('/me', FichaController.me);
fichaRoutes.get('/:id', FichaController.show);
fichaRoutes.patch('/:id/status', FichaController.updateStatus);
fichaRoutes.get('/', authorizeRole(['ADMIN', 'GESTOR']), FichaController.index);
fichaRoutes.delete('/:id', authorizeRole(['ADMIN', 'GESTOR']), FichaController.delete);
fichaRoutes.delete('/:id/hard', authorizeRole(['ADMIN']), FichaController.forceDelete);

export default fichaRoutes;