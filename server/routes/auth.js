import express from 'express';
import { iniciarSesion, registrarUsuario } from '../controller/auth.controller.js';

const router = express.Router();

// Rutas de autenticación
router.post('/login', iniciarSesion);
router.post('/register', registrarUsuario);

export default router;
