import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware para analizar JSON
app.use(express.json());

// Configuración de directorios estáticos
const __dirname = path.resolve();

// Servir archivos de la carpeta "uploads"
const uploadDirectory = process.env.UPLOADS_PATH || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDirectory));


// Servir archivos de la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

import authRoutes from './routes/auth.js';
import carritoRoutes from './routes/carrito.js';
import categoriasRoutes from './routes/categorias.js';
import pedidosRoutes from './routes/pedidos.js';
import productosRoutes from './routes/productos.js';
import imagenRoutes from './routes/imagen.js';
import usuariosRoutes from './routes/usuarios.js';

// Configurar las rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/image', imagenRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Manejar rutas no encontradas en la API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: "La ruta no existe en la API" });
});

// Manejar cualquier otra ruta y redirigir al archivo index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
