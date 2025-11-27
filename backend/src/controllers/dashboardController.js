// src/controllers/dashboardController.js
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Reservation = require('../models/Reservation');

// @desc    Obtener estadísticas generales del dashboard
// @route   GET /api/dashboard/estadisticas
// @access  Privado/Admin
const obtenerEstadisticasGenerales = async (req, res) => {
  try {
    // Contadores generales
    const totalUsuarios = await User.countDocuments({ rol: 'usuario' });
    const totalVehiculos = await Vehicle.countDocuments();
    const totalReservas = await Reservation.countDocuments();
    const vehiculosDisponibles = await Vehicle.countDocuments({ estado: 'disponible' });
    const reservasActivas = await Reservation.countDocuments({ 
      estado: { $in: ['pendiente', 'confirmada', 'en_curso'] }
    });

    // Ingresos totales (suma de todas las reservas completadas)
    const ingresosResult = await Reservation.aggregate([
      {
        $match: { estado: 'completada' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$costoTotal' }
        }
      }
    ]);
    const ingresosTotales = ingresosResult.length > 0 ? ingresosResult[0].total : 0;

    // Ingresos del mes actual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const ingresosMesResult = await Reservation.aggregate([
      {
        $match: {
          estado: 'completada',
          updatedAt: { $gte: inicioMes }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$costoTotal' }
        }
      }
    ]);
    const ingresosMesActual = ingresosMesResult.length > 0 ? ingresosMesResult[0].total : 0;

    // Vehículos más populares (top 5)
    const vehiculosPopulares = await Vehicle.find()
      .sort({ reservasTotal: -1 })
      .limit(5)
      .select('marca modelo placa reservasTotal precioDia imagenes.portada');

    // Reservas por estado
    const reservasPorEstado = await Reservation.aggregate([
      {
        $group: {
          _id: '$estado',
          cantidad: { $sum: 1 }
        }
      }
    ]);

    // Últimas 5 reservas
    const ultimasReservas = await Reservation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('usuario', 'nombre correo')
      .populate('vehiculo', 'marca modelo placa');

    // Usuarios nuevos este mes
    const usuariosNuevosMes = await User.countDocuments({
      createdAt: { $gte: inicioMes }
    });

    // Tasa de ocupación (vehículos reservados vs disponibles)
    const vehiculosReservados = await Vehicle.countDocuments({ estado: 'reservado' });
    const tasaOcupacion = totalVehiculos > 0 
      ? ((vehiculosReservados / totalVehiculos) * 100).toFixed(2) 
      : 0;

    res.json({
      success: true,
      data: {
        resumen: {
          totalUsuarios,
          totalVehiculos,
          totalReservas,
          vehiculosDisponibles,
          reservasActivas,
          ingresosTotales,
          ingresosMesActual,
          usuariosNuevosMes,
          tasaOcupacion: parseFloat(tasaOcupacion)
        },
        vehiculosPopulares,
        reservasPorEstado,
        ultimasReservas
      }
    });
  } catch (error) {
    console.error('Error en obtenerEstadisticasGenerales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// @desc    Obtener estadísticas de reservas por periodo
// @route   GET /api/dashboard/reservas-periodo
// @access  Privado/Admin
const obtenerReservasPorPeriodo = async (req, res) => {
  try {
    const { inicio, fin, periodo } = req.query;

    let fechaInicio, fechaFin;

    if (inicio && fin) {
      fechaInicio = new Date(inicio);
      fechaFin = new Date(fin);
    } else {
      // Por defecto: últimos 30 días
      fechaFin = new Date();
      fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - 30);
    }

    // Agrupar por día, semana o mes según el parámetro
    let agrupacion;
    switch (periodo) {
      case 'mes':
        agrupacion = {
          año: { $year: '$createdAt' },
          mes: { $month: '$createdAt' }
        };
        break;
      case 'semana':
        agrupacion = {
          año: { $year: '$createdAt' },
          semana: { $week: '$createdAt' }
        };
        break;
      default: // día
        agrupacion = {
          año: { $year: '$createdAt' },
          mes: { $month: '$createdAt' },
          dia: { $dayOfMonth: '$createdAt' }
        };
    }

    const reservasPorPeriodo = await Reservation.aggregate([
      {
        $match: {
          createdAt: { $gte: fechaInicio, $lte: fechaFin }
        }
      },
      {
        $group: {
          _id: agrupacion,
          cantidad: { $sum: 1 },
          ingresos: { $sum: '$costoTotal' }
        }
      },
      {
        $sort: { '_id.año': 1, '_id.mes': 1, '_id.dia': 1 }
      }
    ]);

    res.json({
      success: true,
      periodo: {
        inicio: fechaInicio,
        fin: fechaFin
      },
      data: reservasPorPeriodo
    });
  } catch (error) {
    console.error('Error en obtenerReservasPorPeriodo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservas por periodo',
      error: error.message
    });
  }
};

// @desc    Obtener reporte de vehículos
// @route   GET /api/dashboard/reporte-vehiculos
// @access  Privado/Admin
const obtenerReporteVehiculos = async (req, res) => {
  try {
    const totalVehiculos = await Vehicle.countDocuments();
    
    // Vehículos por estado
    const vehiculosPorEstado = await Vehicle.aggregate([
      {
        $group: {
          _id: '$estado',
          cantidad: { $sum: 1 }
        }
      }
    ]);

    // Vehículos por tipo
    const vehiculosPorTipo = await Vehicle.aggregate([
      {
        $group: {
          _id: '$tipo',
          cantidad: { $sum: 1 }
        }
      }
    ]);

    // Vehículos por transmisión
    const vehiculosPorTransmision = await Vehicle.aggregate([
      {
        $group: {
          _id: '$caracteristicas.transmision',
          cantidad: { $sum: 1 }
        }
      }
    ]);

    // Precio promedio por día
    const precioPromedioResult = await Vehicle.aggregate([
      {
        $group: {
          _id: null,
          promedio: { $avg: '$precioDia' }
        }
      }
    ]);
    const precioPromedio = precioPromedioResult.length > 0 
      ? precioPromedioResult[0].promedio.toFixed(2) 
      : 0;

    // Vehículos con más vistas
    const vehiculosMasVistos = await Vehicle.find()
      .sort({ vistasTotal: -1 })
      .limit(10)
      .select('marca modelo placa vistasTotal reservasTotal precioDia');

    res.json({
      success: true,
      data: {
        totalVehiculos,
        precioPromedio: parseFloat(precioPromedio),
        vehiculosPorEstado,
        vehiculosPorTipo,
        vehiculosPorTransmision,
        vehiculosMasVistos
      }
    });
  } catch (error) {
    console.error('Error en obtenerReporteVehiculos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte de vehículos',
      error: error.message
    });
  }
};

// @desc    Obtener actividad reciente
// @route   GET /api/dashboard/actividad-reciente
// @access  Privado/Admin
const obtenerActividadReciente = async (req, res) => {
  try {
    const limite = Number(req.query.limite) || 20;

    // Últimos usuarios registrados
    const ultimosUsuarios = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('nombre correo rol createdAt');

    // Últimas reservas
    const ultimasReservas = await Reservation.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('usuario', 'nombre correo')
      .populate('vehiculo', 'marca modelo placa');

    // Últimos vehículos agregados
    const ultimosVehiculos = await Vehicle.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('marca modelo placa precioDia createdAt');

    res.json({
      success: true,
      data: {
        ultimosUsuarios,
        ultimasReservas,
        ultimosVehiculos
      }
    });
  } catch (error) {
    console.error('Error en obtenerActividadReciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividad reciente',
      error: error.message
    });
  }
};

module.exports = {
  obtenerEstadisticasGenerales,
  obtenerReservasPorPeriodo,
  obtenerReporteVehiculos,
  obtenerActividadReciente
};