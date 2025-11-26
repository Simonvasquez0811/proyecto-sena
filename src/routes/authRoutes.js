// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  registrarUsuario,
  iniciarSesion,
  obtenerPerfil,
  actualizarPerfil
} = require('../controllers/authController');
const { protegerRuta } = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/registro', registrarUsuario);
router.post('/login', iniciarSesion);

// Rutas protegidas (requieren autenticación)
router.get('/perfil', protegerRuta, obtenerPerfil);
router.put('/perfil', protegerRuta, actualizarPerfil);

module.exports = router;