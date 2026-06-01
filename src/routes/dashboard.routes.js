import { Router } from 'express';
import DashboardController from '../controllers/DashboardController.js';
import ensureAuthenticated from '../middlewares/auth.js';

const dashboardRoutes = Router();

dashboardRoutes.get('/', ensureAuthenticated, DashboardController.show);

export default dashboardRoutes;