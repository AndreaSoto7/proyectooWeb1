import express from 'express';
import {
  crearCategoria,
  listarCategorias,
  listarCategoriasConProductos,
  actualizarCategoria,
  eliminarCategoria,
  obtenerCategoria,
} from '../controller/categorias.controller.js';
import { autenticarUsuario, esAdministrador } from '../middleware/auth.js';

const router = express.Router();

// Crear categoría (Solo administrador)
router.post('/', autenticarUsuario, esAdministrador, crearCategoria);
// Listar todas las categorías (Público)
router.get('/', listarCategorias);

// Listar categorías con productos (Público)
router.get('/con-productos', listarCategoriasConProductos);
// Actualizar categoría (Solo administrador)
router.put('/:id', autenticarUsuario, esAdministrador, actualizarCategoria);
router.get('/:id', autenticarUsuario, esAdministrador, obtenerCategoria);

// Eliminar categoría (Solo administrador)
router.delete('/:id', autenticarUsuario, esAdministrador, eliminarCategoria);

export default router;
