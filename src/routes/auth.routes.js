import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import ensureAuthenticated from '../middlewares/auth.js';

const authRoutes = Router();

authRoutes.post('/login', AuthController.login);
authRoutes.post('/logout', ensureAuthenticated, AuthController.logout);
authRoutes.get('/validate-token', ensureAuthenticated, AuthController.validateToken);
authRoutes.get('/me', ensureAuthenticated, AuthController.me);

export default authRoutes;