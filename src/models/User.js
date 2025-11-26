// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  correo: {
    type: String,
    required: [true, 'El correo es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un correo válido']
  },
  contraseña: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    match: [/^(?=.*\d)(?=.*[\W_]).+$/,'La contraseña debe tener al menos un número y un carácter especial']
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio']
  },
  cedula: {
    type: String,
    required: [true, 'La cédula es obligatoria'],
    unique: true
  },
  licencia: {
    type: String,
    required: [true, 'La licencia de conducción es obligatoria']
  },
  rol: {
    type: String,
    enum: ['usuario', 'administrador'],
    default: 'usuario'
  },
  activo: {
    type: Boolean,
    default: true
  },
  verificado: {
    type: Boolean,
    default: false
  },
  intentosFallidos: {
    type: Number,
    default: 0
  },
  bloqueadoHasta: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Middleware para encriptar contraseña antes de guardar
userSchema.pre('save', async function() { // ¡AQUÍ ESTÁ LA CORRECCIÓN!
  // 1. Quitar 'next' del argumento
  
  if (!this.isModified('contraseña')) {
    return; // 2. Simplemente retornar, sin llamar a next()
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.contraseña = await bcrypt.hash(this.contraseña, salt);
    // 3. ¡Eliminar la llamada a next() aquí!
  } catch (error) {
    // 4. En async hooks, es mejor lanzar el error, Mongoose lo captura
    throw error; 
  }
});

// Método para comparar contraseñas
userSchema.methods.compararContraseña = async function(contraseñaIngresada) {
  return await bcrypt.compare(contraseñaIngresada, this.contraseña);
};

// Método para verificar si la cuenta está bloqueada
userSchema.methods.estaBloqueado = function() {
  if (this.bloqueadoHasta && this.bloqueadoHasta > Date.now()) {
    return true;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;