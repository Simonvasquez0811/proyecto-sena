// src/controllers/vehicleController.js
const Vehicle = require('../models/Vehicle');

// @desc    Crear nuevo vehículo (solo admin)
// @route   POST /api/vehiculos
// @access  Privado/Admin
const crearVehiculo = async (req, res) => {
  try {
    // Validar que haya al menos una imagen de portada
    if (!req.body.imagenes || !req.body.imagenes.portada) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar una imagen de portada'
      });
    }

    const vehiculo = await Vehicle.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Vehículo creado exitosamente',
      data: vehiculo
    });
  } catch (error) {
    console.error('Error en crearVehiculo:', error);
    
    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: mensajes
      });
    }

    // Error de duplicado (placa)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'La placa del vehículo ya está registrada'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear vehículo',
      error: error.message
    });
  }
};

// @desc    Obtener todos los vehículos con filtros
// @route   GET /api/vehiculos
// @access  Público
const obtenerVehiculos = async (req, res) => {
  try {
    // Construir filtros de búsqueda
    const filtros = {};

    // Filtro por tipo
    if (req.query.tipo) {
      filtros.tipo = req.query.tipo;
    }

    // Filtro por estado (por defecto solo disponibles)
    if (req.query.estado) {
      filtros.estado = req.query.estado;
    } else {
      filtros.estado = 'disponible';
    }

    // Filtro por comuna
    if (req.query.comuna) {
      filtros['ubicacion.comuna'] = req.query.comuna;
    }

    // Filtro por precio (rango)
    if (req.query.precioMin || req.query.precioMax) {
      filtros.precioDia = {};
      if (req.query.precioMin) {
        filtros.precioDia.$gte = Number(req.query.precioMin);
      }
      if (req.query.precioMax) {
        filtros.precioDia.$lte = Number(req.query.precioMax);
      }
    }

    // Filtro por marca
    if (req.query.marca) {
      filtros.marca = new RegExp(req.query.marca, 'i'); // Búsqueda insensible a mayúsculas
    }

    // Filtro por transmisión
    if (req.query.transmision) {
      filtros['caracteristicas.transmision'] = req.query.transmision;
    }

    // Filtro por combustible
    if (req.query.combustible) {
      filtros['caracteristicas.combustible'] = req.query.combustible;
    }

    // Filtro por número de pasajeros (mínimo)
    if (req.query.pasajeros) {
      filtros['caracteristicas.pasajeros'] = { $gte: Number(req.query.pasajeros) };
    }

    // Filtro por año (rango)
    if (req.query.añoMin || req.query.añoMax) {
      filtros.año = {};
      if (req.query.añoMin) {
        filtros.año.$gte = Number(req.query.añoMin);
      }
      if (req.query.añoMax) {
        filtros.año.$lte = Number(req.query.añoMax);
      }
    }

    // Paginación
    const pagina = Number(req.query.pagina) || 1;
    const limite = Number(req.query.limite) || 10;
    const skip = (pagina - 1) * limite;

    // Ordenamiento
    let ordenamiento = { createdAt: -1 }; // Por defecto más recientes primero
    
    if (req.query.ordenar) {
      switch (req.query.ordenar) {
        case 'precio-asc':
          ordenamiento = { precioDia: 1 };
          break;
        case 'precio-desc':
          ordenamiento = { precioDia: -1 };
          break;
        case 'año-desc':
          ordenamiento = { año: -1 };
          break;
        case 'popular':
          ordenamiento = { reservasTotal: -1 };
          break;
        case 'mejor-calificado':
          ordenamiento = { 'calificacion.promedio': -1 };
          break;
      }
    }

    // Ejecutar consulta
    const vehiculos = await Vehicle.find(filtros)
      .limit(limite)
      .skip(skip)
      .sort(ordenamiento);

    // Contar total de documentos
    const total = await Vehicle.countDocuments(filtros);

    res.json({
      success: true,
      count: vehiculos.length,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
      data: vehiculos
    });
  } catch (error) {
    console.error('Error en obtenerVehiculos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener vehículos',
      error: error.message
    });
  }
};

// @desc    Obtener un vehículo por ID
// @route   GET /api/vehiculos/:id
// @access  Público
const obtenerVehiculoPorId = async (req, res) => {
  try {
    const vehiculo = await Vehicle.findById(req.params.id);

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    // Incrementar contador de vistas
    await vehiculo.incrementarVistas();

    res.json({
      success: true,
      data: vehiculo
    });
  } catch (error) {
    console.error('Error en obtenerVehiculoPorId:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener vehículo',
      error: error.message
    });
  }
};

// @desc    Actualizar vehículo (solo admin)
// @route   PUT /api/vehiculos/:id
// @access  Privado/Admin
const actualizarVehiculo = async (req, res) => {
  try {
    const vehiculo = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Retornar el documento actualizado
        runValidators: true // Ejecutar validaciones
      }
    );

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Vehículo actualizado exitosamente',
      data: vehiculo
    });
  } catch (error) {
    console.error('Error en actualizarVehiculo:', error);
    
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: mensajes
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar vehículo',
      error: error.message
    });
  }
};

// @desc    Eliminar vehículo (solo admin)
// @route   DELETE /api/vehiculos/:id
// @access  Privado/Admin
const eliminarVehiculo = async (req, res) => {
  try {
    const vehiculo = await Vehicle.findById(req.params.id);

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    // Verificar si tiene reservas activas
    if (vehiculo.estado === 'reservado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un vehículo con reservas activas'
      });
    }

    await vehiculo.deleteOne();

    res.json({
      success: true,
      message: 'Vehículo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en eliminarVehiculo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar vehículo',
      error: error.message
    });
  }
};

// @desc    Cambiar estado del vehículo (solo admin)
// @route   PATCH /api/vehiculos/:id/estado
// @access  Privado/Admin
const cambiarEstadoVehiculo = async (req, res) => {
  try {
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        success: false,
        message: 'El estado es obligatorio'
      });
    }

    const vehiculo = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true, runValidators: true }
    );

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    res.json({
      success: true,
      message: `Estado cambiado a: ${estado}`,
      data: vehiculo
    });
  } catch (error) {
    console.error('Error en cambiarEstadoVehiculo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado',
      error: error.message
    });
  }
};

// @desc    Actualizar imagen de portada (solo admin)
// @route   PATCH /api/vehiculos/:id/portada
// @access  Privado/Admin
const actualizarImagenPortada = async (req, res) => {
  try {
    const { urlPortada } = req.body;

    if (!urlPortada) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar la URL de la imagen de portada'
      });
    }

    const vehiculo = await Vehicle.findById(req.params.id);

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    vehiculo.imagenes.portada = urlPortada;
    await vehiculo.save();

    res.json({
      success: true,
      message: 'Imagen de portada actualizada exitosamente',
      data: vehiculo
    });
  } catch (error) {
    console.error('Error en actualizarImagenPortada:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar imagen de portada',
      error: error.message
    });
  }
};

// @desc    Agregar imagen a galería (solo admin)
// @route   POST /api/vehiculos/:id/imagenes
// @access  Privado/Admin
const agregarImagenGaleria = async (req, res) => {
  try {
    const { url, descripcion, orden } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar la URL de la imagen'
      });
    }

    const vehiculo = await Vehicle.findById(req.params.id);

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    vehiculo.imagenes.galeria.push({
      url,
      descripcion: descripcion || '',
      orden: orden || vehiculo.imagenes.galeria.length
    });

    await vehiculo.save();

    res.json({
      success: true,
      message: 'Imagen agregada a la galería',
      data: vehiculo
    });
  } catch (error) {
    console.error('Error en agregarImagenGaleria:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar imagen',
      error: error.message
    });
  }
};

// @desc    Eliminar imagen de galería (solo admin)
// @route   DELETE /api/vehiculos/:id/imagenes/:imagenId
// @access  Privado/Admin
const eliminarImagenGaleria = async (req, res) => {
  try {
    const vehiculo = await Vehicle.findById(req.params.id);

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    vehiculo.imagenes.galeria = vehiculo.imagenes.galeria.filter(
      img => img._id.toString() !== req.params.imagenId
    );

    await vehiculo.save();

    res.json({
      success: true,
      message: 'Imagen eliminada de la galería',
      data: vehiculo
    });
  } catch (error) {
    console.error('Error en eliminarImagenGaleria:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar imagen',
      error: error.message
    });
  }
};

module.exports = {
  crearVehiculo,
  obtenerVehiculos,
  obtenerVehiculoPorId,
  actualizarVehiculo,
  eliminarVehiculo,
  cambiarEstadoVehiculo,
  actualizarImagenPortada,
  agregarImagenGaleria,
  eliminarImagenGaleria
};