import { Router } from 'express';
import UserController from '../controllers/UsuarioController.js';
import ensureAuthenticated from '../middlewares/auth.js';
import authorizeRole from '../middlewares/role.js';

const usuarioRoutes = Router();

// Pública: cadastro
usuarioRoutes.post('/', UserController.create);

// Todas as rotas abaixo exigem token
usuarioRoutes.use(ensureAuthenticated);

// Cidadão pode ver e editar o próprio perfil
usuarioRoutes.get('/:id', UserController.show);
usuarioRoutes.put('/:id', UserController.update);

// Listagem e busca: apenas GESTOR e ADMIN
usuarioRoutes.get('/', authorizeRole(['ADMIN', 'GESTOR']), UserController.index);

// Soft delete: apenas ADMIN (GESTOR não pode excluir usuários)
usuarioRoutes.delete('/:id', authorizeRole(['ADMIN']), UserController.delete);

export default usuarioRoutes;