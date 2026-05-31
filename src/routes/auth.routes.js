import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import ensureAuthenticated from '../middlewares/auth.js';

const authRoutes = Router();

// Públicas
authRoutes.post('/login', AuthController.login);
authRoutes.post('/forgot-password', AuthController.forgotPassword);
authRoutes.post('/reset-password', AuthController.resetPassword);

// Privadas
authRoutes.post('/logout', ensureAuthenticated, AuthController.logout);
authRoutes.get('/validate-token', ensureAuthenticated, AuthController.validateToken);
authRoutes.get('/me', ensureAuthenticated, AuthController.me);
authRoutes.patch('/change-password', ensureAuthenticated, AuthController.changePassword);
authRoutes.patch('/device', ensureAuthenticated, AuthController.updateDevice);

export default authRoutes;