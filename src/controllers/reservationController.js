// src/controllers/reservationController.js
const Reservation = require('../models/Reservation');
const Vehicle = require('../models/Vehicle');

// @desc    Crear nueva reserva
// @route   POST /api/reservas
// @access  Privado
const crearReserva = async (req, res) => {
  try {
    const { vehiculo, fechaInicio, fechaFin, lugarEntrega, lugarDevolucion, notas } = req.body;

    // Validar campos obligatorios
    if (!vehiculo || !fechaInicio || !fechaFin || !lugarEntrega || !lugarDevolucion) {
      return res.status(400).json({
        success: false,
        message: 'Por favor complete todos los campos obligatorios'
      });
    }

    // Verificar que el vehículo existe
    const vehiculoEncontrado = await Vehicle.findById(vehiculo);

    if (!vehiculoEncontrado) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    // Verificar que el vehículo esté disponible
    if (vehiculoEncontrado.estado !== 'disponible') {
      return res.status(400).json({
        success: false,
        message: 'El vehículo no está disponible para reserva'
      });
    }

    // Verificar que no haya reservas en las mismas fechas
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    const reservaExistente = await Reservation.findOne({
      vehiculo,
      estado: { $in: ['pendiente', 'confirmada', 'en_curso'] },
      $or: [
        { fechaInicio: { $lte: fechaFinDate }, fechaFin: { $gte: fechaInicioDate } }
      ]
    });

    if (reservaExistente) {
      return res.status(400).json({
        success: false,
        message: 'El vehículo ya tiene una reserva en esas fechas'
      });
    }

    // Calcular días y costo total
    const diferenciaDias = Math.ceil((fechaFinDate - fechaInicioDate) / (1000 * 60 * 60 * 24));
    const costoTotal = diferenciaDias * vehiculoEncontrado.precioDia;

    // Crear la reserva
    const reserva = await Reservation.create({
      usuario: req.usuario._id,
      vehiculo,
      fechaInicio: fechaInicioDate,
      fechaFin: fechaFinDate,
      diasReserva: diferenciaDias,
      costoTotal,
      lugarEntrega,
      lugarDevolucion,
      notas,
      historialEstados: [{
        estado: 'pendiente',
        fecha: new Date(),
        observacion: 'Reserva creada'
      }]
    });

    // Cambiar estado del vehículo a reservado
    vehiculoEncontrado.estado = 'reservado';
    await vehiculoEncontrado.save();

    // Poblar información del vehículo en la respuesta
    await reserva.populate('vehiculo');
    await reserva.populate('usuario', 'nombre correo telefono');

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: reserva
    });
  } catch (error) {
    console.error('Error en crearReserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear reserva',
      error: error.message
    });
  }
};

// @desc    Obtener todas las reservas (Admin ve todas, usuario ve solo las suyas)
// @route   GET /api/reservas
// @access  Privado
const obtenerReservas = async (req, res) => {
  try {
    let filtro = {};

    // Si es usuario normal, solo ver sus propias reservas
    if (req.usuario.rol !== 'administrador') {
      filtro.usuario = req.usuario._id;
    }

    // Filtro por estado (opcional)
    if (req.query.estado) {
      filtro.estado = req.query.estado;
    }

    const reservas = await Reservation.find(filtro)
      .populate('vehiculo')
      .populate('usuario', 'nombre correo telefono')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reservas.length,
      data: reservas
    });
  } catch (error) {
    console.error('Error en obtenerReservas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservas',
      error: error.message
    });
  }
};

// @desc    Obtener una reserva por ID
// @route   GET /api/reservas/:id
// @access  Privado
const obtenerReservaPorId = async (req, res) => {
  try {
    const reserva = await Reservation.findById(req.params.id)
      .populate('vehiculo')
      .populate('usuario', 'nombre correo telefono');

    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Verificar que el usuario sea dueño de la reserva o sea admin
    if (
      req.usuario.rol !== 'administrador' &&
      reserva.usuario._id.toString() !== req.usuario._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta reserva'
      });
    }

    res.json({
      success: true,
      data: reserva
    });
  } catch (error) {
    console.error('Error en obtenerReservaPorId:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reserva',
      error: error.message
    });
  }
};

// @desc    Cambiar estado de reserva (Admin)
// @route   PATCH /api/reservas/:id/estado
// @access  Privado/Admin
const cambiarEstadoReserva = async (req, res) => {
  try {
    const { estado, observacion } = req.body;

    if (!estado) {
      return res.status(400).json({
        success: false,
        message: 'El estado es obligatorio'
      });
    }

    const reserva = await Reservation.findById(req.params.id).populate('vehiculo');

    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Actualizar estado de la reserva
    reserva.estado = estado;
    reserva.historialEstados.push({
      estado,
      fecha: new Date(),
      observacion: observacion || `Estado cambiado a ${estado}`
    });

    await reserva.save();

    // Si la reserva se completa o cancela, liberar el vehículo
    if (estado === 'completada' || estado === 'cancelada') {
      const vehiculo = await Vehicle.findById(reserva.vehiculo._id);
      if (vehiculo) {
        vehiculo.estado = 'disponible';
        await vehiculo.save();
      }
    }

    res.json({
      success: true,
      message: `Estado de reserva cambiado a: ${estado}`,
      data: reserva
    });
  } catch (error) {
    console.error('Error en cambiarEstadoReserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de reserva',
      error: error.message
    });
  }
};

// @desc    Cancelar reserva (Usuario o Admin)
// @route   DELETE /api/reservas/:id
// @access  Privado
const cancelarReserva = async (req, res) => {
  try {
    const reserva = await Reservation.findById(req.params.id).populate('vehiculo');

    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Verificar permisos
    if (
      req.usuario.rol !== 'administrador' &&
      reserva.usuario.toString() !== req.usuario._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cancelar esta reserva'
      });
    }

    // Verificar que la reserva no esté completada
    if (reserva.estado === 'completada') {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar una reserva completada'
      });
    }

    // Cambiar estado a cancelada
    reserva.estado = 'cancelada';
    reserva.historialEstados.push({
      estado: 'cancelada',
      fecha: new Date(),
      observacion: 'Reserva cancelada por el usuario'
    });

    await reserva.save();

    // Liberar el vehículo
    const vehiculo = await Vehicle.findById(reserva.vehiculo._id);
    if (vehiculo) {
      vehiculo.estado = 'disponible';
      await vehiculo.save();
    }

    res.json({
      success: true,
      message: 'Reserva cancelada exitosamente',
      data: reserva
    });
  } catch (error) {
    console.error('Error en cancelarReserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar reserva',
      error: error.message
    });
  }
};

// @desc    Obtener historial de reservas del usuario
// @route   GET /api/reservas/mis-reservas
// @access  Privado
const obtenerMisReservas = async (req, res) => {
  try {
    const reservas = await Reservation.find({ usuario: req.usuario._id })
      .populate('vehiculo')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reservas.length,
      data: reservas
    });
  } catch (error) {
    console.error('Error en obtenerMisReservas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de reservas',
      error: error.message
    });
  }
};

module.exports = {
  crearReserva,
  obtenerReservas,
  obtenerReservaPorId,
  cambiarEstadoReserva,
  cancelarReserva,
  obtenerMisReservas
};