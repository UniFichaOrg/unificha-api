import { Router } from 'express';
import ProfissionalController from '../controllers/ProfissionalController.js';
import ensureAuthenticated from '../middlewares/auth.js';
import authorizeRole from '../middlewares/role.js';

const profissionalRoutes = Router();

profissionalRoutes.use(ensureAuthenticated);

const gmt = authorizeRole(['ADMIN', 'GESTOR']);

profissionalRoutes.post('/', gmt, ProfissionalController.create);
profissionalRoutes.get('/', ProfissionalController.index);
profissionalRoutes.get('/:id', ProfissionalController.show);
profissionalRoutes.put('/:id', gmt, ProfissionalController.update);
profissionalRoutes.patch('/:id/inativar', gmt, ProfissionalController.inativar);
profissionalRoutes.patch('/:id/reativar', authorizeRole(['ADMIN']), ProfissionalController.reativar);
profissionalRoutes.delete('/:id', authorizeRole(['ADMIN']), ProfissionalController.delete);

export default profissionalRoutes;