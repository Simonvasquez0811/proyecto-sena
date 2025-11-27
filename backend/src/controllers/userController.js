// src/controllers/userController.js
const User = require('../models/User');

// @desc    Obtener todos los usuarios (Admin)
// @route   GET /api/usuarios
// @access  Privado/Admin
const obtenerUsuarios = async (req, res) => {
  try {
    // Filtros opcionales
    const filtros = {};

    if (req.query.rol) {
      filtros.rol = req.query.rol;
    }

    if (req.query.activo !== undefined) {
      filtros.activo = req.query.activo === 'true';
    }

    if (req.query.verificado !== undefined) {
      filtros.verificado = req.query.verificado === 'true';
    }

    // Búsqueda por nombre o correo
    if (req.query.buscar) {
      filtros.$or = [
        { nombre: new RegExp(req.query.buscar, 'i') },
        { correo: new RegExp(req.query.buscar, 'i') }
      ];
    }

    // Paginación
    const pagina = Number(req.query.pagina) || 1;
    const limite = Number(req.query.limite) || 10;
    const skip = (pagina - 1) * limite;

    const usuarios = await User.find(filtros)
      .select('-contraseña')
      .limit(limite)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filtros);

    res.json({
      success: true,
      count: usuarios.length,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
      data: usuarios
    });
  } catch (error) {
    console.error('Error en obtenerUsuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// @desc    Obtener un usuario por ID (Admin)
// @route   GET /api/usuarios/:id
// @access  Privado/Admin
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id).select('-contraseña');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error en obtenerUsuarioPorId:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};

// @desc    Cambiar rol de usuario (Admin)
// @route   PATCH /api/usuarios/:id/rol
// @access  Privado/Admin
const cambiarRolUsuario = async (req, res) => {
  try {
    const { rol } = req.body;

    if (!rol || !['usuario', 'administrador'].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido. Debe ser "usuario" o "administrador"'
      });
    }

    const usuario = await User.findByIdAndUpdate(
      req.params.id,
      { rol },
      { new: true, runValidators: true }
    ).select('-contraseña');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: `Rol cambiado a: ${rol}`,
      data: usuario
    });
  } catch (error) {
    console.error('Error en cambiarRolUsuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar rol',
      error: error.message
    });
  }
};

// @desc    Activar/Desactivar usuario (Admin)
// @route   PATCH /api/usuarios/:id/estado
// @access  Privado/Admin
const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { activo } = req.body;

    if (activo === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar el estado (activo: true/false)'
      });
    }

    const usuario = await User.findByIdAndUpdate(
      req.params.id,
      { activo },
      { new: true, runValidators: true }
    ).select('-contraseña');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: activo ? 'Usuario activado' : 'Usuario desactivado',
      data: usuario
    });
  } catch (error) {
    console.error('Error en cambiarEstadoUsuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado',
      error: error.message
    });
  }
};

// @desc    Verificar usuario (Admin)
// @route   PATCH /api/usuarios/:id/verificar
// @access  Privado/Admin
const verificarUsuario = async (req, res) => {
  try {
    const usuario = await User.findByIdAndUpdate(
      req.params.id,
      { verificado: true },
      { new: true }
    ).select('-contraseña');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario verificado exitosamente',
      data: usuario
    });
  } catch (error) {
    console.error('Error en verificarUsuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar usuario',
      error: error.message
    });
  }
};

// @desc    Eliminar usuario (Admin)
// @route   DELETE /api/usuarios/:id
// @access  Privado/Admin
const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir que el admin se elimine a sí mismo
    if (usuario._id.toString() === req.usuario._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta'
      });
    }

    await usuario.deleteOne();

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en eliminarUsuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

// @desc    Resetear intentos fallidos (Admin)
// @route   PATCH /api/usuarios/:id/resetear-intentos
// @access  Privado/Admin
const resetearIntentosFallidos = async (req, res) => {
  try {
    const usuario = await User.findByIdAndUpdate(
      req.params.id,
      { 
        intentosFallidos: 0,
        bloqueadoHasta: null
      },
      { new: true }
    ).select('-contraseña');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Intentos fallidos reseteados y cuenta desbloqueada',
      data: usuario
    });
  } catch (error) {
    console.error('Error en resetearIntentosFallidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al resetear intentos',
      error: error.message
    });
  }
};

// @desc    Obtener estadísticas de usuarios (Admin)
// @route   GET /api/usuarios/estadisticas
// @access  Privado/Admin
const obtenerEstadisticasUsuarios = async (req, res) => {
  try {
    const totalUsuarios = await User.countDocuments();
    const usuariosActivos = await User.countDocuments({ activo: true });
    const usuariosVerificados = await User.countDocuments({ verificado: true });
    const administradores = await User.countDocuments({ rol: 'administrador' });
    const usuariosComunes = await User.countDocuments({ rol: 'usuario' });
    const usuariosBloqueados = await User.countDocuments({
      bloqueadoHasta: { $gt: new Date() }
    });

    // Usuarios registrados por mes (últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const usuariosPorMes = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: seisMesesAtras }
        }
      },
      {
        $group: {
          _id: {
            año: { $year: '$createdAt' },
            mes: { $month: '$createdAt' }
          },
          cantidad: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.año': 1, '_id.mes': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        resumen: {
          total: totalUsuarios,
          activos: usuariosActivos,
          verificados: usuariosVerificados,
          bloqueados: usuariosBloqueados,
          administradores,
          usuariosComunes
        },
        registrosPorMes: usuariosPorMes
      }
    });
  } catch (error) {
    console.error('Error en obtenerEstadisticasUsuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  cambiarRolUsuario,
  cambiarEstadoUsuario,
  verificarUsuario,
  eliminarUsuario,
  resetearIntentosFallidos,
  obtenerEstadisticasUsuarios
};