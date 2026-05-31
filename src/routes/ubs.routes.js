import { Router } from 'express';
import UbsController from '../controllers/UbsController.js';
import ensureAuthenticated from '../middlewares/auth.js';
import authorizeRole from '../middlewares/role.js';

const ubsRoutes = Router();

ubsRoutes.use(ensureAuthenticated);

const gmt = authorizeRole(['ADMIN', 'GESTOR']);

ubsRoutes.post('/', gmt, UbsController.create);
ubsRoutes.get('/', UbsController.index);
ubsRoutes.get('/:id', UbsController.show);
ubsRoutes.put('/:id', gmt, UbsController.update);
ubsRoutes.delete('/:id', gmt, UbsController.delete);
ubsRoutes.delete('/:id/hard', authorizeRole(['ADMIN']), UbsController.forceDelete);

export default ubsRoutes;