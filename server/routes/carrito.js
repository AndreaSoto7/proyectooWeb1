import express from 'express';
import {
  agregarAlCarrito,
  verCarrito,
  modificarCantidadCarrito,
  eliminarProductoCarrito,
  finalizarCompra,
  eliminarUnaCantidadDelCarrito,
  verCarritoPorid
} from '../controller/carrito.controller.js';

const router = express.Router();

// Agregar producto al carrito
router.post('/', agregarAlCarrito);

// Ver carrito por usuario autenticado
router.get('/usuario/:id_usuario', verCarritoPorid);


// Ver carrito por sesión
router.get('/session/:session_id', verCarrito);

 // Modificar cantidad de producto en el carrito
router.put('/:id_carrito', modificarCantidadCarrito);

// Eliminar producto del carrito
router.delete('/:id_carrito/:id_producto', eliminarProductoCarrito);
// Reducir una unidad del carrito
router.delete('/session/:session_id/:id_producto', eliminarUnaCantidadDelCarrito);

// Finalizar compra
router.post('/finalizar/:id_carrito', finalizarCompra);

export default router;
