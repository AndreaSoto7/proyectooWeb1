import {
  listarPedidosPorUsuario,
  listarTodosLosPedidos,
  obtenerDetallesDePedido,
  cancelarPedidoRepository,
  confirmarPedidoRepository,
} from '../repositories/order.repository.js';

// Listar pedidos de un usuario
const listarPedidos = async (req, res) => {
  const { id_usuario } = req.params;

  if (!id_usuario) {
    return res.status(400).json({ error: 'Se requiere el id_usuario' });
  }

  try {
    const pedidos = await listarPedidosPorUsuario(id_usuario);

    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'No se encontraron pedidos para este usuario' });
    }

    for (const pedido of pedidos) {
      pedido.detalles = await obtenerDetallesDePedido(pedido.id_pedido);
    }

    res.status(200).json(pedidos);
  } catch (err) {
    console.error('Error al listar los pedidos:', err);
    res.status(500).json({ error: 'Error al listar los pedidos' });
  }
};

// Listar todos los pedidos con detalles (administrador)
const listarTodosPedidos = async (req, res) => {
  try {
    const pedidos = await listarTodosLosPedidos();

    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'No hay pedidos registrados' });
    }

    res.status(200).json(pedidos);
  } catch (err) {
    console.error('Error al listar todos los pedidos:', err);
    res.status(500).json({ error: 'Error al listar todos los pedidos' });
  }
};

// Cancelar un pedido
const cancelarPedido = async (req, res) => {
  const { id_pedido } = req.params;

  try {
    const pedidoCancelado = await cancelarPedidoRepository(id_pedido);

    if (!pedidoCancelado) {
      return res.status(400).json({ error: 'Solo se pueden cancelar pedidos en estado pendiente' });
    }

    res.status(200).json({ message: 'Pedido cancelado con éxito', pedido: pedidoCancelado });
  } catch (err) {
    console.error('Error al cancelar el pedido:', err);
    res.status(500).json({ error: 'Error al cancelar el pedido' });
  }
};

// Confirmar un pedido
const confirmarPedido = async (req, res) => {
  const { id_pedido } = req.params;

  try {
    const pedidoConfirmado = await confirmarPedidoRepository(id_pedido);

    if (!pedidoConfirmado) {
      return res.status(400).json({ error: 'Solo se pueden confirmar pedidos en estado pendiente' });
    }

    res.status(200).json({ message: 'Pedido confirmado con éxito', pedido: pedidoConfirmado });
  } catch (err) {
    console.error('Error al confirmar el pedido:', err);
    res.status(500).json({ error: 'Error al confirmar el pedido' });
  }
};

export { listarPedidos, listarTodosPedidos, cancelarPedido, confirmarPedido };
