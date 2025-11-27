// src/models/Reservation.js
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },
  vehiculo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'El vehículo es obligatorio']
  },
  fechaInicio: {
    type: Date,
    required: [true, 'La fecha de inicio es obligatoria']
  },
  fechaFin: {
    type: Date,
    required: [true, 'La fecha de fin es obligatoria']
  },
  diasReserva: {
    type: Number,
    required: true
  },
  costoTotal: {
    type: Number,
    required: [true, 'El costo total es obligatorio'],
    min: [0, 'El costo no puede ser negativo']
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada'],
    default: 'pendiente'
  },
  metodoPago: {
    type: String,
    enum: ['efectivo', 'tarjeta', 'transferencia', 'pendiente'],
    default: 'pendiente'
  },
  pagoCompletado: {
    type: Boolean,
    default: false
  },
  comprobantePago: {
    type: String // URL del comprobante
  },
  notas: {
    type: String,
    maxlength: [300, 'Las notas no pueden exceder 300 caracteres']
  },
  // Información adicional
  lugarEntrega: {
    type: String,
    required: [true, 'El lugar de entrega es obligatorio']
  },
  lugarDevolucion: {
    type: String,
    required: [true, 'El lugar de devolución es obligatorio']
  },
  // Historial de cambios de estado
  historialEstados: [{
    estado: String,
    fecha: {
      type: Date,
      default: Date.now
    },
    observacion: String
  }]
}, {
  timestamps: true
});

// Middleware ÚNICO para validar fechas y calcular días antes de guardar
reservationSchema.pre('save', function () {
    // Retornamos una nueva Promesa para gestionar el flujo sin usar next()
    return new Promise((resolve, reject) => { 
        
        // 1. VALIDACIÓN: la fecha de fin debe ser posterior a la de inicio
        if (this.fechaFin <= this.fechaInicio) {
            // Usa reject para devolver el error
            return reject(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));
        }
        
        // 2. CÁLCULO: Calcular días de reserva
        if (this.fechaInicio && this.fechaFin) {
            const diferencia = this.fechaFin - this.fechaInicio;
            this.diasReserva = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
        }
        
        // 3. CONTINUAR: Llama a resolve() si todo es exitoso
        resolve(); 
    });
});

// Índices para mejorar búsquedas
reservationSchema.index({ usuario: 1 });
reservationSchema.index({ vehiculo: 1 });
reservationSchema.index({ estado: 1 });
reservationSchema.index({ fechaInicio: 1, fechaFin: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;