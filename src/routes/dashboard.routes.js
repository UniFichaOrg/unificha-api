import { Router } from 'express';
import DashboardController from '../controllers/DashboardController.js';
import ensureAuthenticated from '../middlewares/auth.js';
import authorizeRole from '../middlewares/role.js';

const dashboardRoutes = Router();
dashboardRoutes.use(ensureAuthenticated);

dashboardRoutes.get('/cidadao', authorizeRole(['CIDADAO']), DashboardController.cidadao);
dashboardRoutes.get('/admin', authorizeRole(['ADMIN', 'GESTOR']), DashboardController.admin);
dashboardRoutes.get('/atendendo-agora', authorizeRole(['ADMIN', 'GESTOR', 'AGENTE']), DashboardController.atendendoAgora);

export default dashboardRoutes;