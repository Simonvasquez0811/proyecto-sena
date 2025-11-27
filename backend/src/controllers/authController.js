// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Función para generar JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token válido por 30 días
  });
};

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/registro
// @access  Público
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, correo, contraseña, telefono, cedula, licencia } = req.body;

    // Validar que todos los campos estén presentes
    if (!nombre || !correo || !contraseña || !telefono || !cedula || !licencia) {
      return res.status(400).json({
        success: false,
        message: 'Por favor complete todos los campos obligatorios'
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExiste = await User.findOne({ correo });
    if (usuarioExiste) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya está registrado'
      });
    }

    // Verificar si la cédula ya existe
    const cedulaExiste = await User.findOne({ cedula });
    if (cedulaExiste) {
      return res.status(400).json({
        success: false,
        message: 'La cédula ya está registrada'
      });
    }

    // Crear el usuario
    const usuario = await User.create({
      nombre,
      correo,
      contraseña,
      telefono,
      cedula,
      licencia,
      rol: 'usuario' // Por defecto es usuario
    });

    // Generar token
    const token = generarToken(usuario._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        token
      }
    });
  } catch (error) {
    console.error('Error en registrarUsuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Público
const iniciarSesion = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    // Validar campos
    if (!correo || !contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingrese correo y contraseña'
      });
    }

    // Buscar usuario
    const usuario = await User.findOne({ correo });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // Verificar si está bloqueado (RF-008: Bloqueo por intentos fallidos)
    if (usuario.estaBloqueado()) {
      const minutosRestantes = Math.ceil(
        (usuario.bloqueadoHasta - Date.now()) / (1000 * 60)
      );
      return res.status(403).json({
        success: false,
        message: `Cuenta bloqueada. Intente nuevamente en ${minutosRestantes} minutos`
      });
    }

    // Verificar contraseña
    const contraseñaCorrecta = await usuario.compararContraseña(contraseña);

    if (!contraseñaCorrecta) {
      // Incrementar intentos fallidos
      usuario.intentosFallidos += 1;

      // Si alcanza 5 intentos, bloquear por 30 minutos
      if (usuario.intentosFallidos >= 5) {
        usuario.bloqueadoHasta = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
        await usuario.save();

        return res.status(403).json({
          success: false,
          message: 'Cuenta bloqueada por 30 minutos debido a múltiples intentos fallidos'
        });
      }

      await usuario.save();

      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        intentosRestantes: 5 - usuario.intentosFallidos
      });
    }

    // Login exitoso: resetear intentos fallidos
    usuario.intentosFallidos = 0;
    usuario.bloqueadoHasta = null;
    await usuario.save();

    // Generar token
    const token = generarToken(usuario._id);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        token
      }
    });
  } catch (error) {
    console.error('Error en iniciarSesion:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// @desc    Obtener perfil del usuario autenticado
// @route   GET /api/auth/perfil
// @access  Privado
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario._id).select('-contraseña');

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error en obtenerPerfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

// @desc    Actualizar perfil del usuario
// @route   PUT /api/auth/perfil
// @access  Privado
const actualizarPerfil = async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario._id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar campos permitidos
    usuario.nombre = req.body.nombre || usuario.nombre;
    usuario.telefono = req.body.telefono || usuario.telefono;
    usuario.licencia = req.body.licencia || usuario.licencia;

    // Si se envía nueva contraseña
    if (req.body.contraseña) {
      usuario.contraseña = req.body.contraseña;
    }

    const usuarioActualizado = await usuario.save();

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: usuarioActualizado._id,
        nombre: usuarioActualizado.nombre,
        correo: usuarioActualizado.correo,
        telefono: usuarioActualizado.telefono,
        rol: usuarioActualizado.rol
      }
    });
  } catch (error) {
    console.error('Error en actualizarPerfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
  obtenerPerfil,
  actualizarPerfil
};