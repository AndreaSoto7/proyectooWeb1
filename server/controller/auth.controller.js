import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { verificarCorreo, crearUsuario, obtenerUsuarioPorCorreo } from '../repositories/user.repository.js';
import { asociarCarrito } from './carrito.controller.js';
import bcrypt from 'bcrypt';


const iniciarSesion = async (req, res) => {
    const { correo, contrasena, session_id } = req.body;

    try {
        // Verificar credenciales del usuario
        const usuario = await obtenerUsuarioPorCorreo(correo);
        if (!usuario) return res.status(401).json({ error: 'Credenciales incorrectas' });

        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!contrasenaValida) return res.status(401).json({ error: 'Credenciales incorrectas' });

        // Generar token
        const token = jwt.sign({ id: usuario.id, tipo_usuario: usuario.tipo_usuario }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Asociar carrito temporal con el usuario
        if (session_id) {
            await asociarCarrito(usuario.id, session_id);
        }

        res.status(200).json({ message: 'Inicio de sesión exitoso', token, usuario });
    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};


// Registrar usuario
const registrarUsuario = async (req, res) => {
  const { nombre_completo, correo, contrasena, tipo_usuario, nit, direccion } = req.body;
  let { session_id } = req.body;

  if (!nombre_completo || !correo || !contrasena || !tipo_usuario) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  // Validar longitud de la contraseña
  if (contrasena.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    // Verificar si el correo ya está registrado
    const correoExistente = await verificarCorreo(correo);
    if (correoExistente) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Generar automáticamente un session_id si no se proporciona
    if (!session_id) {
      session_id = uuidv4();
    }

    // Crear usuario
    const nuevoUsuario = await crearUsuario({
      nombre_completo,
      correo,
      contrasena,
      tipo_usuario,
      nit,
      direccion,
    });

    // Asociar carrito temporal al nuevo usuario, si existe
    await asociarCarrito(nuevoUsuario.id, session_id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: nuevoUsuario,
      session_id,
    });
  } catch (err) {
    console.error('Error al registrar el usuario:', err);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

export { iniciarSesion, registrarUsuario };
