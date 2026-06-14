import { Router } from 'express';
import userRoutes from './usuario.routes.js';
import authRoutes from './auth.routes.js';
import profissionalRoutes from "./profissional.routes.js";
import ubsRoutes from './ubs.routes.js';
import agendaRoutes from './agenda.routes.js';
import fichaRoutes from './ficha.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import relatorioRoutes from "./relatorio.routes.js";
import buscaRoutes from "./busca.routes.js";
import filaRoutes from "./fila.routes.js";

const routes = Router();

routes.use('/users', userRoutes);
routes.use('/auth', authRoutes);
routes.use('/profissionais', profissionalRoutes);
routes.use('/ubs', ubsRoutes);
routes.use('/agendas', agendaRoutes);
routes.use('/fichas', fichaRoutes);
routes.use('/dashboard', dashboardRoutes);
routes.use('/relatorios', relatorioRoutes);
routes.use('/busca', buscaRoutes);
routes.use('/fila', filaRoutes);

export default routes;