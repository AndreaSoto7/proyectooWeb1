import query from '../models/db.js';

// Listar todos los productos
const listarProductos = async () => {
  try {
      const sql = `
          SELECT 
              p.id, p.nombre, p.descripcion, p.precio, 
              p.imagen_url, p.id_categoria, p.stock, 
              p.fecha_creacion, p.fecha_actualizacion, 
              p.imagenid, c.nombre AS categoria_nombre 
          FROM productos p
          LEFT JOIN categorias c ON p.id_categoria = c.id
          ORDER BY p.fecha_creacion DESC;
      `;
      const result = await query(sql);
      return result.rows;
  } catch (error) {
      console.error('Error al listar productos:', error);
      throw error;
  }
};

// Obtener producto por ID
export const obtenerProductoPorId = async (id) => {
  const sql = 'SELECT * FROM productos WHERE id = $1';
  try {
      const result = await query(sql, [id]);
      return result.rows[0];
  } catch (error) {
      console.error('Error al obtener el producto por ID:', error);
      throw error;
  }
};

// Crear un producto
const crearProducto = async ({ nombre, descripcion, precio, imagen_url, id_categoria, stock }) => {
  const sql = `
    INSERT INTO productos (nombre, descripcion, precio, imagen_url, id_categoria, stock)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
  `;
  const result = await query(sql, [nombre, descripcion, precio, imagen_url, id_categoria, stock || 0]);
  return result.rows[0];
};

// Actualizar un producto
const actualizarProducto = async (id, datos) => {
  const { nombre, descripcion, precio, imagen_url, id_categoria, stock } = datos;
  const sql = `
    UPDATE productos
    SET 
      nombre = COALESCE($1, nombre), 
      descripcion = COALESCE($2, descripcion), 
      precio = COALESCE($3, precio), 
      imagen_url = COALESCE($4, imagen_url), 
      id_categoria = COALESCE($5, id_categoria), 
      stock = COALESCE($6, stock)
    WHERE id = $7 RETURNING *;
  `;
  const result = await query(sql, [nombre, descripcion, precio, imagen_url, id_categoria, stock, id]);
  return result.rows[0];
};

// Eliminar un producto
const eliminarProducto = async (id) => {
  const sql = 'DELETE FROM productos WHERE id = $1 RETURNING *;';
  const result = await query(sql, [id]);
  return result.rows[0];
};

// Verificar si un producto está asociado a pedidos pendientes
const verificarProductoEnPedidosPendientes = async (id) => {
  const sql = `
    SELECT COUNT(*) AS conteo
    FROM detalles_pedido dp
    INNER JOIN pedidos p ON dp.id_pedido = p.id
    WHERE dp.id_producto = $1 AND p.estado = 'pendiente';
  `;
  const result = await query(sql, [id]);
  return parseInt(result.rows[0].conteo, 10);
};

// Obtener productos destacados
export const obtenerProductosDestacados = async () => {
  console.log("Ejecutando consulta para productos destacados");
  const sql = 'SELECT * FROM productos WHERE destacado = TRUE';
  try {
      const result = await query(sql);
      console.log("Resultados obtenidos:", result.rows);
      return result.rows;
  } catch (error) {
      console.error('Error al obtener productos destacados:', error);
      throw error;
  }
};






export {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  verificarProductoEnPedidosPendientes,
};
