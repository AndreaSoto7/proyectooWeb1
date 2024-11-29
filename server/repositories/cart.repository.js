import query from '../models/db.js';

// Buscar carrito por usuario
const buscarCarritoPorUsuario = async (id_usuario) => {
  const sql = `SELECT * FROM carritos WHERE id_usuario = $1`;
  const result = await query(sql, [id_usuario]);
  return result.rows[0];
};

// Buscar carrito por session_id
const buscarCarritoPorSessionId = async (session_id) => {
  if (!session_id || session_id.trim() === "") {
    console.log("El session_id está vacío o no definido.");
    return null; // No hay carrito asociado a un session_id vacío
  }

  const sql = 'SELECT * FROM carritos WHERE session_id = $1';
  const result = await query(sql, [session_id]);
  return result.rows[0];
};



// Crear un carrito
const crearCarrito = async (id_usuario, session_id) => {
  const sql = `
      INSERT INTO carritos (id_usuario, session_id)
      VALUES ($1, $2)
      RETURNING *;
  `;
  const result = await query(sql, [id_usuario, session_id]);
  console.log("Carrito creado:", result.rows[0]); // Log para depuración
  return result.rows[0];
};


// Asociar carrito a un usuario
const asociarCarritoAUsuario = async (id_usuario, id_carrito) => {
  const sql = `
      UPDATE carritos
      SET id_usuario = $1, session_id = NULL
      WHERE id = $2;
  `;
  await query(sql, [id_usuario, id_carrito]);
  console.log(`Carrito ${id_carrito} asociado al usuario ${id_usuario}`);
};


// Obtener carrito por usuario
const obtenerCarritoPorUsuario = async (id_usuario) => {
  const sql = `
      SELECT p.id AS id_producto, p.nombre, d.cantidad, d.subtotal, p.imagen_url
      FROM carritos c
      INNER JOIN detalles_carrito d ON c.id = d.id_carrito
      INNER JOIN productos p ON d.id_producto = p.id
      WHERE c.id_usuario = $1;
  `;
  const result = await query(sql, [id_usuario]);
  console.log("Consulta SQL ejecutada para usuario:", id_usuario, "Resultados:", result.rows);
  return result.rows;
};





// Obtener carrito por sesión
const obtenerCarritoPorId = async (session_id) => {
  const sql = `
      SELECT 
          p.id AS id_producto,
          p.nombre,
          d.cantidad,
          d.subtotal,
          p.imagen_url -- Incluimos la URL de la imagen
      FROM 
          carritos c
      INNER JOIN 
          detalles_carrito d ON c.id = d.id_carrito
      INNER JOIN 
          productos p ON d.id_producto = p.id
      WHERE 
          c.id_usuario = $1;
  `;
  const result = await query(sql, [session_id]);
  return result.rows;
};


// Obtener carrito por sesión
const obtenerCarritoPorSesion = async (session_id) => {
  const sql = `
      SELECT 
          p.id AS id_producto,
          p.nombre,
          d.cantidad,
          d.subtotal,
          p.imagen_url
      FROM 
          carritos c
      INNER JOIN 
          detalles_carrito d ON c.id = d.id_carrito
      INNER JOIN 
          productos p ON d.id_producto = p.id
      WHERE 
          c.session_id = $1;
  `;
  const result = await query(sql, [session_id]);
  console.log("Productos en el carrito:", result.rows);
  return result.rows;
};





// Agregar producto al carrito
const agregarProductoACarrito = async (id_carrito, id_producto, cantidad) => {
  const verificarSql = `
      SELECT cantidad
      FROM detalles_carrito
      WHERE id_carrito = $1 AND id_producto = $2;
  `;
  const verificarResult = await query(verificarSql, [id_carrito, id_producto]);

  if (verificarResult.rows.length > 0) {
      // Actualizar cantidad si el producto ya existe en el carrito
      const nuevaCantidad = parseInt(verificarResult.rows[0].cantidad, 10) + parseInt(cantidad, 10);
      const actualizarSql = `
          UPDATE detalles_carrito
          SET cantidad = $1::integer,
              subtotal = ($1::integer * (SELECT precio FROM productos WHERE id = $2))::numeric(10, 2)
          WHERE id_carrito = $3 AND id_producto = $2
          RETURNING *;
      `;
      const actualizarResult = await query(actualizarSql, [nuevaCantidad, id_producto, id_carrito]);
      console.log("Producto actualizado en el carrito:", actualizarResult.rows[0]);
      return actualizarResult.rows[0];
  } else {
      // Insertar producto si no existe
      const insertarSql = `
          INSERT INTO detalles_carrito (id_carrito, id_producto, cantidad, subtotal)
          VALUES ($1::integer, $2::integer, $3::integer, ($3::integer * (SELECT precio FROM productos WHERE id = $2))::numeric(10, 2))
          RETURNING *;
      `;
      const insertarResult = await query(insertarSql, [id_carrito, id_producto, parseInt(cantidad, 10)]);
      console.log("Producto insertado en el carrito:", insertarResult.rows[0]);
      return insertarResult.rows[0];
  }
};




// Actualizar cantidad de producto en el carrito
const actualizarCantidadProducto = async (id_carrito, id_producto, cantidad) => {
  const sql = `
    UPDATE detalles_carrito
    SET cantidad = $1::integer, subtotal = ($1::integer * (SELECT precio FROM productos WHERE id = $2))::numeric(10, 2)
    WHERE id_carrito = $3 AND id_producto = $2 RETURNING *;
  `;
  const cantidadInt = parseInt(cantidad, 10); // Convertir cantidad a entero
  const result = await query(sql, [cantidadInt, id_producto, id_carrito]);
  return result.rows[0];
};

// Eliminar un producto del carrito
const eliminarProductoDelCarrito = async (id_carrito, id_producto) => {
  const sql = `
    DELETE FROM detalles_carrito
    WHERE id_carrito = $1 AND id_producto = $2
    RETURNING *;
  `;
  const result = await query(sql, [id_carrito, id_producto]);
  return result.rows[0]; // Retorna el producto eliminado o undefined si no se encontró
};


export {
  buscarCarritoPorUsuario,
  buscarCarritoPorSessionId,
  crearCarrito,
  asociarCarritoAUsuario,
  obtenerCarritoPorUsuario,
  obtenerCarritoPorSesion,
  agregarProductoACarrito,
  actualizarCantidadProducto,
  eliminarProductoDelCarrito ,
  obtenerCarritoPorId
};
