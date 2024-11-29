import { v4 as uuidv4 } from 'uuid';
import {
  buscarCarritoPorUsuario,
  buscarCarritoPorSessionId,
  crearCarrito,
  asociarCarritoAUsuario,
  obtenerCarritoPorUsuario,
  obtenerCarritoPorSesion,
  agregarProductoACarrito,
  actualizarCantidadProducto,
  eliminarProductoDelCarrito,
  obtenerCarritoPorId

} from '../repositories/cart.repository.js';
import query from '../models/db.js';
// Asociar carrito temporal con un usuario autenticado
const asociarCarrito = async (id_usuario, session_id) => {
  try {
      const carrito = await buscarCarritoPorSessionId(session_id);

      if (carrito) {
          await asociarCarritoAUsuario(id_usuario, carrito.id);
          console.log(`Carrito ${carrito.id} asociado al usuario ${id_usuario}`);
      } else {
          console.log("No se encontró un carrito asociado al session_id:", session_id);
      }
  } catch (err) {
      console.error('Error al asociar el carrito:', err);
      throw new Error('Error al asociar el carrito.');
  }
};



// Agregar producto al carrito
const agregarAlCarrito = async (req, res) => {
  const { id_producto, cantidad, id_usuario } = req.body;
  let { session_id } = req.body;

  console.log("Datos recibidos:", { id_producto, cantidad, id_usuario, session_id });

  try {
      if (!id_usuario && !session_id) {
          session_id = uuidv4();
      }

      let carrito = id_usuario
          ? await buscarCarritoPorUsuario(id_usuario)
          : await buscarCarritoPorSessionId(session_id);

      console.log("Carrito encontrado o creado:", carrito);

      if (!carrito) {
          carrito = await crearCarrito(id_usuario, session_id);
          console.log("Carrito creado:", carrito);
      }

      const producto = await agregarProductoACarrito(carrito.id, id_producto, cantidad);
      console.log("Producto agregado al carrito:", producto);

      res.status(201).json({ message: "Producto agregado al carrito", producto, session_id });
  } catch (err) {
      console.error("Error al agregar al carrito:", err);
      res.status(500).json({ error: "Error al agregar al carrito" });
  }
};


const verCarritoPorid = async (req, res) => {
  const { id_usuario } = req.params;

  try {
      const carrito = await obtenerCarritoPorUsuario(id_usuario);

      if (!carrito || carrito.length === 0) {
          return res.status(200).json({ carrito: [], message: "El carrito está vacío." });
      }

      res.status(200).json({ carrito });
  } catch (err) {
      console.error("Error al obtener el carrito del usuario:", err);
      res.status(500).json({ error: "Error al obtener el carrito" });
  }
};



// Ver carrito
const verCarrito = async (req, res) => {
  const { id_usuario, session_id } = req.query;

  try {
      let carrito;
      if (id_usuario) {
          console.log("Buscando carrito para usuario:", id_usuario);
          carrito = await obtenerCarritoPorUsuario(id_usuario);
      } else if (session_id) {
          console.log("Buscando carrito para session_id:", session_id);
          carrito = await obtenerCarritoPorSesion(session_id);
      }

      if (!carrito || carrito.length === 0) {
          return res.status(200).json({ carrito: [], message: "El carrito está vacío." });
      }

      res.status(200).json({ carrito });
  } catch (err) {
      console.error("Error al obtener el carrito:", err);
      res.status(500).json({ error: "Error al obtener el carrito." });
  }
};

// Modificar cantidad en el carrito
const modificarCantidadCarrito = async (req, res) => {
  const { id_carrito } = req.params;
  const { id_producto, cantidad } = req.body;

  if (!id_producto || !cantidad || cantidad <= 0) {
    return res.status(400).json({ error: 'Faltan datos obligatorios o los valores no son válidos' });
  }

  try {
    const cantidadInt = parseInt(cantidad, 10); // Validar cantidad como entero
    const productoActualizado = await actualizarCantidadProducto(id_carrito, id_producto, cantidadInt);

    if (!productoActualizado) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    res.status(200).json({ message: 'Cantidad actualizada', producto: productoActualizado });
  } catch (err) {
    console.error('Error al modificar la cantidad del carrito:', err);
    res.status(500).json({ error: 'Error al modificar la cantidad del carrito' });
  }
};

const finalizarCompra = async (req, res) => {
  const { id_usuario, direccion_entrega, pais, ciudad, telefono } = req.body;
  const { carritoId } = req.params;  

  if (!carritoId) {
      return res.status(400).json({ error: "Carrito ID no proporcionado." });
  }

  if (!id_usuario) {
      return res.status(400).json({ error: "El usuario no está autenticado." });
  }

  if (!direccion_entrega || !pais || !ciudad || !telefono) {
      return res.status(400).json({ error: "Faltan datos obligatorios para finalizar la compra." });
  }

  try {
      console.log("Finalizando compra para el usuario:", id_usuario);

      // Verificar que el carrito existe y no está vacío
      const carrito = await obtenerCarritoPorUsuario(id_usuario);
      if (!carrito || carrito.length === 0) {
          return res.status(400).json({ error: "El carrito está vacío." });
      }

      // Calcular el total del pedido
      const total = carrito.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);

      // Crear un pedido en la base de datos
      const crearPedidoSQL = `
          INSERT INTO pedidos (id_usuario, direccion_entrega, pais, ciudad, telefono, total)
          VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;
      `;
      const result = await query(crearPedidoSQL, [
          id_usuario,
          direccion_entrega,
          pais,
          ciudad,
          telefono,
          total,
      ]);

      const pedidoId = result.rows[0].id;

      // Vaciar el carrito después de crear el pedido
      await query(`DELETE FROM detalles_carrito WHERE id_carrito = $1`, [carritoId]);

      res.status(200).json({ message: "Compra finalizada con éxito", pedidoId });
  } catch (err) {
      console.error("Error al finalizar la compra:", err);
      res.status(500).json({ error: "Error al finalizar la compra." });
  }
};




const eliminarProductoCarrito = async (req, res) => {
  const { id_carrito, id_producto } = req.params;

  if (!id_carrito || !id_producto) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const productoEliminado = await eliminarProductoDelCarrito(id_carrito, id_producto);

    if (!productoEliminado) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    res.status(200).json({ message: 'Producto eliminado del carrito', producto: productoEliminado });
  } catch (err) {
    console.error('Error al eliminar producto del carrito:', err);
    res.status(500).json({ error: 'Error al eliminar producto del carrito' });
  }
};

const eliminarUnaCantidadDelCarrito = async (req, res) => {
  const { session_id, id_producto } = req.params;
  const id_usuario = req.body.id_usuario;

  if (!id_producto || (!session_id && !id_usuario)) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
      // Obtener carrito según id_usuario o session_id
      const carrito = id_usuario
          ? await buscarCarritoPorUsuario(id_usuario)
          : await buscarCarritoPorSessionId(session_id);

      if (!carrito) {
          return res.status(404).json({ error: 'Carrito no encontrado.' });
      }

      // Verificar cantidad del producto en el carrito
      const cantidadActualQuery = `
          SELECT cantidad
          FROM detalles_carrito
          WHERE id_carrito = $1 AND id_producto = $2;
      `;
      const cantidadActualResult = await query(cantidadActualQuery, [carrito.id, id_producto]);

      if (cantidadActualResult.rows.length === 0) {
          return res.status(404).json({ error: 'Producto no encontrado en el carrito.' });
      }

      const cantidadActual = cantidadActualResult.rows[0].cantidad;

      if (cantidadActual <= 1) {
          // Eliminar producto si cantidad es 1 o menos
          await eliminarProductoDelCarrito(carrito.id, id_producto);
          return res.status(200).json({ message: 'Producto eliminado del carrito.' });
      }

      // Reducir cantidad en 1
      const productoActualizado = await actualizarCantidadProducto(
          carrito.id,
          id_producto,
          cantidadActual - 1
      );

      res.status(200).json({ message: 'Cantidad disminuida en el carrito.', producto: productoActualizado });
  } catch (err) {
      console.error('Error al disminuir cantidad del carrito:', err);
      res.status(500).json({ error: 'Error al disminuir cantidad del carrito.' });
  }
};






export { asociarCarrito, agregarAlCarrito, verCarrito, modificarCantidadCarrito, eliminarProductoCarrito, finalizarCompra, eliminarUnaCantidadDelCarrito, verCarritoPorid };
