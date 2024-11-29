import { listarUsuarios as listarUsuariosRepo,
    actualizarUsuario as actualizarUsuarioRepo, 
    crearUsuario, eliminarUsuario } from '../repositories/user.repository.js';
    import query from '../models/db.js';

    const obtenerUsuarios = async (req, res) => {
        try {
          const usuarios = await listarUsuarios();
          res.status(200).json(usuarios);
        } catch (error) {
          console.error('Error al obtener usuarios:', error);
          res.status(500).json({ error: 'Error al obtener usuarios.' });
        }
      };

const registrarUsuario = async (req, res) => {
    const { nombre_completo, correo, contrasena, tipo_usuario, nit, direccion } = req.body;
  
    if (!nombre_completo || !correo || !contrasena) {
      return res.status(400).json({ error: 'Nombre completo, correo y contraseña son obligatorios.' });
    }
  
    try {
      const nuevoUsuario = await crearUsuario({ nombre_completo, correo, contrasena, tipo_usuario, nit, direccion });
      res.status(201).json({ message: 'Usuario creado exitosamente.', usuario: nuevoUsuario });
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      res.status(500).json({ error: 'Error al registrar el usuario.' });
    }
  };

const modificarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre_completo, correo, tipo_usuario, nit, direccion } = req.body;
  
    if (!id || !nombre_completo || !correo) {
      return res.status(400).json({ error: 'El ID, el nombre completo y el correo son obligatorios' });
    }
  
    try {
      const usuarioActualizado = await actualizarUsuarioRepo(id, {
        nombre_completo,
        correo,
        tipo_usuario,
        nit,
        direccion,
      });
  
      if (!usuarioActualizado) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      res.status(200).json({
        message: 'Usuario actualizado exitosamente',
        usuario: usuarioActualizado,
      });
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
  };

const borrarUsuario = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'El ID es obligatorio' });
    }

    try {
        const usuario = await eliminarUsuario(id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario eliminado con éxito', usuario });
    } catch (err) {
        console.error('Error al eliminar el usuario:', err);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
};

const listarUsuarios = async (req, res) => {
    try {
      const usuarios = await listarUsuariosRepo();
      res.status(200).json(usuarios);
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      res.status(500).json({ error: 'Error al listar usuarios' });
    }
};

const obtenerUsuarioPorId = async (req, res) => {
    const { id } = req.params;
  
    if (!id) {
      return res.status(400).json({ error: 'El ID del usuario es obligatorio.' });
    }
  
    try {
      const sql = 'SELECT id, nombre_completo, correo, tipo_usuario, nit, direccion FROM usuarios WHERE id = $1';
      const result = await query(sql, [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }
  
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
      res.status(500).json({ error: 'Error al obtener el usuario.' });
    }
  };
  
  


export { listarUsuarios, obtenerUsuarios, registrarUsuario, modificarUsuario, borrarUsuario, obtenerUsuarioPorId };
