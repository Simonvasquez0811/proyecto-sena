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

    // Convertir fechas una sola vez
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);
    const ahora = new Date();
    ahora.setHours(0, 0, 0, 0); // Ignorar la hora para comparar solo la fecha

    // Validar que las fechas sean futuras
    if (fechaInicioDate < ahora) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de inicio debe ser hoy o en el futuro'
      });
    }

    if (fechaFinDate <= fechaInicioDate) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio'
      });
    }

    // Validar duración máxima (ejemplo: 30 días)
    const diasDiferencia = Math.ceil((fechaFinDate - fechaInicioDate) / (1000 * 60 * 60 * 24));
    if (diasDiferencia > 30) {
      return res.status(400).json({
        success: false,
        message: 'La reserva no puede exceder 30 días. Para reservas más largas, contacte al administrador.'
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
    const costoTotal = diasDiferencia * vehiculoEncontrado.precioDia;

    // Crear la reserva
    const reserva = await Reservation.create({
      usuario: req.usuario._id,
      vehiculo,
      fechaInicio: fechaInicioDate,
      fechaFin: fechaFinDate,
      diasReserva: diasDiferencia,
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

    // Filtro por vehículo (opcional)
    if (req.query.vehiculo) {
      filtro.vehiculo = req.query.vehiculo;
    }

    // Filtro por usuario (solo admin)
    if (req.query.usuario && req.usuario.rol === 'administrador') {
      filtro.usuario = req.query.usuario;
    }

    // Filtro por rango de fechas
    if (req.query.fechaInicio || req.query.fechaFin) {
      filtro.fechaInicio = {};
      if (req.query.fechaInicio) {
        filtro.fechaInicio.$gte = new Date(req.query.fechaInicio);
      }
      if (req.query.fechaFin) {
        filtro.fechaInicio.$lte = new Date(req.query.fechaFin);
      }
    }

    // Paginación
    const pagina = Number(req.query.pagina) || 1;
    const limite = Number(req.query.limite) || 10;
    const skip = (pagina - 1) * limite;

    const reservas = await Reservation.find(filtro)
      .populate('vehiculo')
      .populate('usuario', 'nombre correo telefono')
      .limit(limite)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Reservation.countDocuments(filtro);

    res.json({
      success: true,
      count: reservas.length,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
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

// @desc    Editar reserva (cambiar fechas) - Usuario o Admin
// @route   PUT /api/reservas/:id
// @access  Privado
const editarReserva = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.body;

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
        message: 'No tienes permiso para editar esta reserva'
      });
    }

    // Solo se pueden editar reservas pendientes o confirmadas
    if (!['pendiente', 'confirmada'].includes(reserva.estado)) {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden editar reservas pendientes o confirmadas'
      });
    }

    // Validar que las fechas sean futuras
    const fechaInicioNueva = new Date(fechaInicio);
    const fechaFinNueva = new Date(fechaFin);
    const ahora = new Date();
    ahora.setHours(0, 0, 0, 0);

    if (fechaInicioNueva < ahora) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de inicio debe ser futura'
      });
    }

    if (fechaFinNueva <= fechaInicioNueva) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio'
      });
    }

    // Verificar disponibilidad en las nuevas fechas
    const reservaExistente = await Reservation.findOne({
      _id: { $ne: reserva._id }, // Excluir la reserva actual
      vehiculo: reserva.vehiculo._id,
      estado: { $in: ['pendiente', 'confirmada', 'en_curso'] },
      $or: [
        { fechaInicio: { $lte: fechaFinNueva }, fechaFin: { $gte: fechaInicioNueva } }
      ]
    });

    if (reservaExistente) {
      return res.status(400).json({
        success: false,
        message: 'El vehículo no está disponible en esas fechas'
      });
    }

    // Calcular nuevos días y costo
    const diferenciaDias = Math.ceil((fechaFinNueva - fechaInicioNueva) / (1000 * 60 * 60 * 24));
    const nuevoCosto = diferenciaDias * reserva.vehiculo.precioDia;

    // Actualizar reserva
    reserva.fechaInicio = fechaInicioNueva;
    reserva.fechaFin = fechaFinNueva;
    reserva.diasReserva = diferenciaDias;
    reserva.costoTotal = nuevoCosto;
    reserva.historialEstados.push({
      estado: reserva.estado,
      fecha: new Date(),
      observacion: 'Fechas actualizadas'
    });

    await reserva.save();

    res.json({
      success: true,
      message: 'Reserva actualizada exitosamente',
      data: reserva
    });
  } catch (error) {
    console.error('Error en editarReserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al editar reserva',
      error: error.message
    });
  }
};

// @desc    Obtener estadísticas de reservas (Admin)
// @route   GET /api/reservas/estadisticas
// @access  Privado/Admin
const obtenerEstadisticasReservas = async (req, res) => {
  try {
    const totalReservas = await Reservation.countDocuments();
    
    const reservasPorEstado = await Reservation.aggregate([
      {
        $group: {
          _id: '$estado',
          cantidad: { $sum: 1 }
        }
      }
    ]);

    const ingresosTotales = await Reservation.aggregate([
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

    const reservasPorVehiculo = await Reservation.aggregate([
      {
        $group: {
          _id: '$vehiculo',
          cantidad: { $sum: 1 },
          ingresos: { $sum: '$costoTotal' }
        }
      },
      {
        $sort: { cantidad: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Poblar información de los vehículos
    await Reservation.populate(reservasPorVehiculo, {
      path: '_id',
      select: 'marca modelo placa'
    });

    res.json({
      success: true,
      data: {
        totalReservas,
        reservasPorEstado,
        ingresosTotales: ingresosTotales.length > 0 ? ingresosTotales[0].total : 0,
        vehiculosMasReservados: reservasPorVehiculo
      }
    });
  } catch (error) {
    console.error('Error en obtenerEstadisticasReservas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
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
  obtenerMisReservas,
  editarReserva,
  obtenerEstadisticasReservas
};