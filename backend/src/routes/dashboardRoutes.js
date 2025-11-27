// src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const {
  obtenerEstadisticasGenerales,
  obtenerReservasPorPeriodo,
  obtenerReporteVehiculos,
  obtenerActividadReciente
} = require('../controllers/dashboardController');
const { protegerRuta, esAdministrador } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación de administrador
router.use(protegerRuta, esAdministrador);

// Estadísticas y reportes
router.get('/estadisticas', obtenerEstadisticasGenerales);
router.get('/reservas-periodo', obtenerReservasPorPeriodo);
router.get('/reporte-vehiculos', obtenerReporteVehiculos);
router.get('/actividad-reciente', obtenerActividadReciente);

module.exports = router;