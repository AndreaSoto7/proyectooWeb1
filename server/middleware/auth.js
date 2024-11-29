import jwt from 'jsonwebtoken';

const autenticarUsuario = (req, res, next) => {
  // Extraer el token
  const token = req.headers.authorization?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.usuario = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const esAdministrador = (req, res, next) => {
  if (req.usuario && req.usuario.tipo_usuario === 'administrador') {
    return next();
  }

  res.status(403).json({ error: 'Acceso denegado: solo los administradores pueden realizar esta acción' });
};

export { autenticarUsuario, esAdministrador };
