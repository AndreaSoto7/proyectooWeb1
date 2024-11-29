import express from 'express';
import {
    obtenerUsuarios,
    registrarUsuario,
    modificarUsuario,
    borrarUsuario,
    listarUsuarios,
    obtenerUsuarioPorId,
} from '../controller/user.controller.js';
import { autenticarUsuario, esAdministrador } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', autenticarUsuario, esAdministrador, obtenerUsuarioPorId);
router.get('/', autenticarUsuario, esAdministrador, listarUsuarios);
router.post('/', autenticarUsuario, esAdministrador, registrarUsuario); 
router.get('/', autenticarUsuario, esAdministrador, obtenerUsuarios); 
router.post('/', autenticarUsuario, esAdministrador, registrarUsuario); 
router.put('/:id', autenticarUsuario, esAdministrador, modificarUsuario);
router.delete('/:id', autenticarUsuario, esAdministrador, borrarUsuario);

export default router;
