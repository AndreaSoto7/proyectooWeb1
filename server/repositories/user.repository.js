import query from '../models/db.js';
import bcrypt from 'bcryptjs';

const verificarCorreo = async (correo) => {
  const sql = 'SELECT * FROM usuarios WHERE correo = $1';
  const result = await query(sql, [correo]);
  return result.rows[0];
};

const crearUsuario = async ({ nombre_completo, correo, contrasena, tipo_usuario, nit, direccion }) => {
  if (!contrasena) {
    throw new Error('La contraseña es obligatoria para crear un usuario.');
  }

  const hashedPassword = await bcrypt.hash(contrasena, 10);
  const sql = `
    INSERT INTO usuarios (nombre_completo, correo, contrasena, tipo_usuario, nit, direccion)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
  `;
  const values = [nombre_completo, correo, hashedPassword, tipo_usuario, nit, direccion];
  const result = await query(sql, values);
  return result.rows[0];
};

const obtenerUsuarioPorCorreo = async (correo) => {
  const sql = 'SELECT * FROM usuarios WHERE correo = $1';
  const result = await query(sql, [correo]);
  return result.rows[0];
};


// Listar todos los usuarios
const listarUsuarios = async () => {
  const sql = 'SELECT id, nombre_completo, correo, tipo_usuario, fecha_creacion FROM usuarios';
  const result = await query(sql);
  return result.rows;
};

const actualizarUsuario = async (id, { nombre_completo, correo, tipo_usuario, nit, direccion }) => {
  const sql = `
    UPDATE usuarios
    SET nombre_completo = $1, correo = $2, tipo_usuario = $3, nit = $4, direccion = $5, fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING id, nombre_completo, correo, tipo_usuario, nit, direccion, fecha_actualizacion;
  `;
  const values = [nombre_completo, correo, tipo_usuario, nit, direccion, id];
  const result = await query(sql, values);
  return result.rows[0];
};

const eliminarUsuario = async (id) => {
  const sql = 'DELETE FROM usuarios WHERE id = $1 RETURNING *;';
  const result = await query(sql, [id]);
  return result.rows[0];
};


export { verificarCorreo, crearUsuario, obtenerUsuarioPorCorreo, listarUsuarios, actualizarUsuario, eliminarUsuario };
