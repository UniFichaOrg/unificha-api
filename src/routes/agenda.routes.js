import { Router } from 'express';
import AgendaController from '../controllers/AgendaController.js';
import ensureAuthenticated from '../middlewares/auth.js';
import authorizeRole from '../middlewares/role.js';

const agendaRoutes = Router();

agendaRoutes.use(ensureAuthenticated);

const gmt = authorizeRole(['ADMIN', 'GESTOR']);

agendaRoutes.post('/', gmt, AgendaController.create);
agendaRoutes.get('/', AgendaController.index);
agendaRoutes.get('/:id', AgendaController.show);
agendaRoutes.put('/:id', gmt, AgendaController.update);
agendaRoutes.delete('/:id', gmt, AgendaController.delete);
agendaRoutes.delete('/:id/hard', authorizeRole(['ADMIN']), AgendaController.forceDelete);

export default agendaRoutes;