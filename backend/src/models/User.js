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
    unique: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{6,10}$/.test(v);
      },
      message: 'La cédula debe tener entre 6 y 10 dígitos'
    }
  },
  licencia: {
    type: String,
    required: [true, 'La licencia de conducción es obligatoria'],
    validate: {
      validator: function(v) {
        return /^[A-Z]-[0-9]{8}$/.test(v);
      },
      message: 'La licencia debe tener el formato C-12345678'
    }
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
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Middleware para encriptar contraseña antes de guardar
userSchema.pre('save', async function() { 
  // Solo encriptar si la contraseña fue modificada
  if (!this.isModified('contraseña')) {
    
    return; 
  }
  const salt = await bcrypt.genSalt(10);
  this.contraseña = await bcrypt.hash(this.contraseña, salt);});

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