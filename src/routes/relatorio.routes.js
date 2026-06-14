import { Router } from 'express';
import RelatorioController from '../controllers/RelatorioController.js';
import ensureAuthenticated from '../middlewares/auth.js';
import authorizeRole from '../middlewares/role.js';

const relatorioRoutes = Router();
relatorioRoutes.use(ensureAuthenticated);

relatorioRoutes.get('/cidadao', authorizeRole(['CIDADAO']), RelatorioController.cidadao);
relatorioRoutes.get('/admin', authorizeRole(['ADMIN', 'GESTOR']), RelatorioController.admin);
relatorioRoutes.get('/admin/top-unidades', authorizeRole(['ADMIN', 'GESTOR']), RelatorioController.topUnidades);

export default relatorioRoutes;