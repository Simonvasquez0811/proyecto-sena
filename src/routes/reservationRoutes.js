// src/routes/reservationRoutes.js
const express = require('express');
const router = express.Router();
const {
  crearReserva,
  obtenerReservas,
  obtenerReservaPorId,
  cambiarEstadoReserva,
  cancelarReserva,
  obtenerMisReservas
} = require('../controllers/reservationController');
const { protegerRuta, esAdministrador } = require('../middlewares/authMiddleware');

// Todas las rutas de reservas requieren autenticación
router.use(protegerRuta);

// Rutas de usuario
router.post('/', crearReserva); // Crear reserva
router.get('/mis-reservas', obtenerMisReservas); // Ver mis reservas
router.get('/:id', obtenerReservaPorId); // Ver detalle de reserva
router.delete('/:id', cancelarReserva); // Cancelar reserva

// Rutas de administrador
router.get('/', obtenerReservas); // Ver todas las reservas (admin)
router.patch('/:id/estado', esAdministrador, cambiarEstadoReserva); // Cambiar estado (admin)

module.exports = router;