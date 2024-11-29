import imagenRepository from '../repositories/imagen.repository.js';
import fs from 'fs';
import path from 'path';

const getMimeType = (fileName) => {
    const extension = path.extname(fileName.toLowerCase());
    switch (extension) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        default:
            return 'image/jpeg';
    }
};

const getImagenById = async (req, res) => {
    const imagenId = req.params.imagenId;

    try {
        const imagen = await imagenRepository.getImagenById(imagenId);

        if (!imagen) {
            return res.status(404).json({ message: 'Imagen no encontrada' });
        }

        fs.readFile(imagen.path, (err, data) => {
            if (err) {
                console.error('Error leyendo el archivo de imagen:', err);
                return res.status(500).json({ message: 'Error leyendo el archivo de imagen' });
            }

            const contentType = getMimeType(imagen.filename);
            res.setHeader('Content-Type', contentType);
            res.send(data);
        });
    } catch (error) {
        console.error('Error obteniendo la imagen:', error);
        res.status(500).json({ message: 'Error al obtener la imagen' });
    }
};


const createImagen = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ningún archivo' });
        }

        const fileName = req.file.filename; // Nombre del archivo subido
        const filePath = req.file.path; // Ruta absoluta al archivo

        const imageId = await imagenRepository.createImagen({ fileName, path: filePath });

        // Construir la URL accesible desde el navegador
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;

        res.status(201).json({
            imageId,
            message: 'Imagen subida con éxito',
            imageUrl, // URL pública
        });
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        res.status(500).json({ message: 'Error al subir la imagen' });
    }
};


export default {
    getImagenById,
    createImagen,
};
