import { Router } from 'express';
import UbsController from '../controllers/UbsController.js';
import ensureAuthenticated from '../middlewares/auth.js';
import authorizeRole from '../middlewares/role.js';

const ubsRoutes = Router();
ubsRoutes.use(ensureAuthenticated);

const gmt = authorizeRole(['ADMIN', 'GESTOR']);

// Endpoints de Busca e Listagem Específicas
ubsRoutes.get('/proximas', UbsController.proximas);
ubsRoutes.get('/:id/agendas', UbsController.agendasAtivas);

// Endpoints Base do CRUD
ubsRoutes.post('/', gmt, UbsController.create);
ubsRoutes.get('/', UbsController.index);
ubsRoutes.get('/:id', UbsController.show);
ubsRoutes.put('/:id', gmt, UbsController.update);

// Operação de Fluxo de Fila em tempo real
ubsRoutes.patch('/:id/fila/pausar', gmt, UbsController.pausarFila);

// Exclusões de Registros
ubsRoutes.delete('/:id', gmt, UbsController.delete);
ubsRoutes.delete('/:id/hard', authorizeRole(['ADMIN']), UbsController.forceDelete);

export default ubsRoutes;