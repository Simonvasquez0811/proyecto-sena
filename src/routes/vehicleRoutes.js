// src/routes/vehicleRoutes.js
const express = require('express');
const router = express.Router();
const {
  crearVehiculo,
  obtenerVehiculos,
  obtenerVehiculoPorId,
  actualizarVehiculo,
  eliminarVehiculo,
  cambiarEstadoVehiculo,
  actualizarImagenPortada,
  agregarImagenGaleria,
  eliminarImagenGaleria
} = require('../controllers/vehicleController');
const { protegerRuta, esAdministrador } = require('../middlewares/authMiddleware');

// Rutas públicas
router.get('/', obtenerVehiculos); // Buscar vehículos con filtros
router.get('/:id', obtenerVehiculoPorId); // Ver detalle de un vehículo

// Rutas protegidas (solo administrador)
router.post('/', protegerRuta, esAdministrador, crearVehiculo);
router.put('/:id', protegerRuta, esAdministrador, actualizarVehiculo);
router.delete('/:id', protegerRuta, esAdministrador, eliminarVehiculo);
router.patch('/:id/estado', protegerRuta, esAdministrador, cambiarEstadoVehiculo);

// Rutas de gestión de imágenes (solo administrador)
router.patch('/:id/portada', protegerRuta, esAdministrador, actualizarImagenPortada);
router.post('/:id/imagenes', protegerRuta, esAdministrador, agregarImagenGaleria);
router.delete('/:id/imagenes/:imagenId', protegerRuta, esAdministrador, eliminarImagenGaleria);

module.exports = router;