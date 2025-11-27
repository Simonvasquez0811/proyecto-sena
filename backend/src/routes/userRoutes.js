// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  cambiarRolUsuario,
  cambiarEstadoUsuario,
  verificarUsuario,
  eliminarUsuario,
  resetearIntentosFallidos,
  obtenerEstadisticasUsuarios
} = require('../controllers/userController');
const { protegerRuta, esAdministrador } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación de administrador
router.use(protegerRuta, esAdministrador);

// Estadísticas
router.get('/estadisticas', obtenerEstadisticasUsuarios);

// CRUD de usuarios
router.get('/', obtenerUsuarios);
router.get('/:id', obtenerUsuarioPorId);
router.delete('/:id', eliminarUsuario);

// Gestión de usuarios
router.patch('/:id/rol', cambiarRolUsuario);
router.patch('/:id/estado', cambiarEstadoUsuario);
router.patch('/:id/verificar', verificarUsuario);
router.patch('/:id/resetear-intentos', resetearIntentosFallidos);

module.exports = router;