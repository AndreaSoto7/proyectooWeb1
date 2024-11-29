import express from 'express';
import multer from 'multer';
import path from 'path';
import { body, validationResult } from 'express-validator';
import {
  listarProductos,
  verProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  verProductosDestacados
} from '../controller/productos.controller.js';
import { autenticarUsuario, esAdministrador } from '../middleware/auth.js';


const router = express.Router();

// Configuración de multer para manejar imágenes
const uploadDirectory = process.env.UPLOADS_PATH || 'uploads';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('El archivo debe ser una imagen válida (JPG, PNG o GIF).'));
    }
    cb(null, true);
  },
});

// Middleware para convertir campos numéricos
const transformarCamposNumericos = (req, res, next) => {
  if (req.body.precio) req.body.precio = parseFloat(req.body.precio);
  if (req.body.stock) req.body.stock = parseInt(req.body.stock, 10);
  if (req.body.id_categoria) req.body.id_categoria = parseInt(req.body.id_categoria, 10);
  next();
};

// Middleware de validación de datos
const validarProducto = [
  body('nombre').notEmpty().isString().withMessage('El nombre es obligatorio y debe ser un texto válido'),
  body('descripcion').optional().isString().withMessage('La descripción debe ser un texto válido'),
  body('precio').notEmpty().isNumeric().withMessage('El precio es obligatorio y debe ser un número válido'),
  body('id_categoria').notEmpty().isNumeric().withMessage('La categoría es obligatoria y debe ser un número válido'),
  body('stock').optional().isNumeric().withMessage('El stock debe ser un número válido'),
  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    next();
  },
];

// Rutas de productos
router.get('/', listarProductos); 
router.get('/destacados', verProductosDestacados); 
router.get('/:id', verProducto);


// Crear producto con imagen
router.post(
  '/',
  autenticarUsuario,
  esAdministrador,
  upload.single('file'), // Opcional: Subir una imagen si se proporciona
  transformarCamposNumericos,
  validarProducto,
  crearProducto
);


// Actualizar producto
router.put(
  '/:id',
  autenticarUsuario,
  esAdministrador,
  upload.single('file'), // Permitir actualización de la imagen
  transformarCamposNumericos, // Convertir campos antes de validar
  validarProducto,
  actualizarProducto
);

// Eliminar producto
router.delete('/:id', autenticarUsuario, esAdministrador, eliminarProducto);


router.use('/:id', (req, res, next) => {
  const { id } = req.params;
  if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID del producto debe ser un número' });
  }
  next();
});


export default router;
