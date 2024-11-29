import query from '../models/db.js';

// Listar pedidos de un usuario
const listarPedidosPorUsuario = async (id_usuario) => {
  const sql = `
    SELECT id AS id_pedido, total, direccion_entrega, estado, fecha
    FROM pedidos
    WHERE id_usuario = $1
    ORDER BY fecha DESC;
  `;
  const result = await query(sql, [id_usuario]);
  return result.rows;
};

// Listar todos los pedidos con detalles
const listarTodosLosPedidos = async () => {
  const sql = `
    SELECT 
      p.id AS id_pedido,
      p.total,
      p.direccion_entrega,
      p.estado,
      p.fecha,
      u.nombre_completo AS cliente,
      json_agg(
        json_build_object(
          'id_producto', dp.id_producto,
          'nombre', prod.nombre,
          'cantidad', dp.cantidad,
          'subtotal', dp.subtotal
        )
      ) AS detalles
    FROM pedidos p
    INNER JOIN usuarios u ON p.id_usuario = u.id
    INNER JOIN detalles_pedido dp ON dp.id_pedido = p.id
    INNER JOIN productos prod ON prod.id = dp.id_producto
    GROUP BY p.id, u.nombre_completo
    ORDER BY p.fecha DESC;
  `;
  const result = await query(sql);
  return result.rows;
};

// Obtener detalles de un pedido específico
const obtenerDetallesDePedido = async (id_pedido) => {
  const sql = `
    SELECT dp.id_pedido, p.id AS id_producto, p.nombre, dp.cantidad, dp.subtotal
    FROM detalles_pedido dp
    INNER JOIN productos p ON dp.id_producto = p.id
    WHERE dp.id_pedido = $1;
  `;
  const result = await query(sql, [id_pedido]);
  return result.rows;
};

// Crear un pedido
const crearPedido = async (id_usuario, direccion_entrega, total, pais) => {
  const sql = `
    INSERT INTO pedidos (id_usuario, direccion_entrega, total, pais)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const result = await query(sql, [id_usuario, direccion_entrega, total, pais]);
  return result.rows[0];
};

// Cancelar un pedido
const cancelarPedidoRepository = async (id_pedido) => {
  const sql = `
    UPDATE pedidos
    SET estado = 'cancelado'
    WHERE id = $1 AND estado = 'pendiente'
    RETURNING *;
  `;
  const result = await query(sql, [id_pedido]);
  return result.rows[0];
};

// Confirmar un pedido
const confirmarPedidoRepository = async (id_pedido) => {
  const sql = `
    UPDATE pedidos
    SET estado = 'completado'
    WHERE id = $1 AND estado = 'pendiente'
    RETURNING *;
  `;
  const result = await query(sql, [id_pedido]);
  return result.rows[0];
};

export {
  listarPedidosPorUsuario,
  listarTodosLosPedidos,
  obtenerDetallesDePedido,
  crearPedido,
  cancelarPedidoRepository,
  confirmarPedidoRepository,
};
