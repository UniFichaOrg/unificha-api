import { Router } from 'express';
import userRoutes from './usuario.routes.js';
import authRoutes from './auth.routes.js';
import ubsRoutes from './ubs.routes.js';
import agendaRoutes from './agenda.routes.js';
import fichaRoutes from './ficha.routes.js';

const routes = Router();

routes.use('/users', userRoutes);
routes.use('/auth', authRoutes);
routes.use('/ubs', ubsRoutes);
routes.use('/agendas', agendaRoutes);
routes.use('/fichas', fichaRoutes);

export default routes;