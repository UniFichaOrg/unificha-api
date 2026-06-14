import { Router } from 'express';
import FichaController from '../controllers/FichaController.js';
import ensureAuthenticated from '../middlewares/auth.js';
import authorizeRole from '../middlewares/role.js';

const fichaRoutes = Router();
fichaRoutes.use(ensureAuthenticated);

// Rotas Estáticas de Ficha
fichaRoutes.post('/', FichaController.create);
fichaRoutes.post('/chamar-proximo', authorizeRole(['ADMIN', 'GESTOR', 'AGENTE']), FichaController.chamarProximo);
fichaRoutes.get('/me', FichaController.me);
fichaRoutes.get('/hoje', FichaController.hojeCidadao);

// Rotas Dinâmicas / Operacionais
fichaRoutes.get('/:id', FichaController.show);
fichaRoutes.patch('/:id/status', FichaController.updateStatus);
fichaRoutes.patch('/:id/iniciar', authorizeRole(['ADMIN', 'GESTOR', 'AGENTE']), FichaController.iniciarAtendimento);
fichaRoutes.patch('/:id/finalizar', authorizeRole(['ADMIN', 'GESTOR', 'AGENTE']), FichaController.finalizarAtendimento);

// Rotas de Remoção e Listagem Administrativa
fichaRoutes.get('/', authorizeRole(['ADMIN', 'GESTOR']), FichaController.index);
fichaRoutes.delete('/:id', authorizeRole(['ADMIN', 'GESTOR']), FichaController.delete);
fichaRoutes.delete('/:id/hard', authorizeRole(['ADMIN']), FichaController.forceDelete);

export default fichaRoutes;