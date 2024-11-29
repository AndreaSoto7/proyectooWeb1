import express from 'express';
import multer from 'multer';
import path from 'path';
import imagenController from '../controller/imagen.controller.js';

const router = express.Router();
const uploadDirectory = process.env.UPLOADS_PATH || 'uploads';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limitar tamaño máximo (5MB)
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Tipo de archivo no permitido. Solo imágenes (JPG, PNG, GIF)'));
        }
        cb(null, true);
    },
});
 
router.get('/:imagenId', imagenController.getImagenById);
router.post('/', upload.single('file'), imagenController.createImagen);

export default router;
