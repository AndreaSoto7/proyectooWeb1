import query from '../models/db.js';

// Listar todas las categorías
const listarCategorias = async () => {
  const sql = 'SELECT * FROM categorias';
  const result = await query(sql);
  return result.rows;
};

// Crear una categoría
const crearCategoria = async (nombre, descripcion) => {
  const sql = `
    INSERT INTO categorias (nombre, descripcion)
    VALUES ($1, $2) RETURNING *;
  `;
  const result = await query(sql, [nombre, descripcion || null]);
  return result.rows[0];
};

// Listar categorías con productos
const listarCategoriasConProductos = async () => {
  const sql = `
    SELECT 
      c.id AS categoria_id,
      c.nombre AS categoria_nombre,
      c.descripcion AS categoria_descripcion,
      p.id AS producto_id,
      p.nombre AS producto_nombre,
      p.descripcion AS producto_descripcion,
      p.precio,
      p.stock
    FROM categorias c
    LEFT JOIN productos p ON c.id = p.id_categoria
    ORDER BY c.id, p.id;
  `;
  const result = await query(sql);
  return result.rows;
};

// Actualizar una categoría por ID
const actualizarCategoria = async (id, nombre, descripcion) => {
  const sql = `
    UPDATE categorias
    SET nombre = $1, descripcion = $2, fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *;
  `;
  const result = await query(sql, [nombre, descripcion || null, id]);
  return result.rows[0];
};




// Eliminar una categoría
const eliminarCategoria = async (id) => {
  const sql = `DELETE FROM categorias WHERE id = $1 RETURNING *;`;
  const result = await query(sql, [id]);

  if (result.rowCount === 0) {
    return null; // Devuelve null si no se eliminó nada
  }

  return result.rows[0]; // Devuelve la categoría eliminada
};



export {
  listarCategorias,
  crearCategoria,
  listarCategoriasConProductos,
  actualizarCategoria, // Exporta esta función
  eliminarCategoria, // Exportar correctamente

};
