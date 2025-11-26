// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para proteger rutas (verificar token)
const protegerRuta = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.usuario = await User.findById(decoded.id).select('-contraseña');

      if (!req.usuario || !req.usuario.activo) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autorizado (inactivo o no encontrado)'
        });
      }

      next(); // Continúa si todo es exitoso

    } catch (error) {
      console.error('Error en autenticación:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
  } else { 
    return res.status(401).json({
      success: false,
      message: 'No autorizado, token no proporcionado'
    });
  }
};

// Middleware para verificar que el usuario sea administrador
const esAdministrador = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'administrador') {
    next(); // Es administrador, continuar
  } else {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de administrador'
    });
  }
};

// Middleware para verificar que el usuario sea el propietario del recurso o administrador
const esUsuarioOAdmin = (req, res, next) => {
  const idUsuarioDelRecurso = req.params.id || req.body.usuario;

  if (
    req.usuario &&
    (req.usuario._id.toString() === idUsuarioDelRecurso ||
      req.usuario.rol === 'administrador')
  ) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. No tienes permisos para realizar esta acción'
    });
  }
};

module.exports = {
  protegerRuta,
  esAdministrador,
  esUsuarioOAdmin
};