import express from 'express';
import {
  listarPedidos,
  listarTodosPedidos,
  cancelarPedido,
  confirmarPedido,
} from '../controller/pedidos.controller.js';
import { autenticarUsuario, esAdministrador } from '../middleware/auth.js';

const router = express.Router();

// Rutas para usuarios
router.get('/:id_usuario', autenticarUsuario, listarPedidos);

// Rutas para administrador
router.get('/', autenticarUsuario, esAdministrador, listarTodosPedidos);
router.put('/:id_pedido/cancelar', autenticarUsuario, cancelarPedido);
router.put('/:id_pedido/confirmar', autenticarUsuario, esAdministrador, confirmarPedido);

export default router;
