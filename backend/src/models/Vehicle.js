// src/models/Vehicle.js
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  marca: {
    type: String,
    required: [true, 'La marca es obligatoria'],
    trim: true
  },
  modelo: {
    type: String,
    required: [true, 'El modelo es obligatorio'],
    trim: true
  },
  año: {
    type: Number,
    required: [true, 'El año es obligatorio'],
    min: [1900, 'Año inválido'],
    max: [new Date().getFullYear() + 1, 'Año inválido']
  },
  placa: {
    type: String,
    required: [true, 'La placa es obligatoria'],
    unique: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{3}[0-9]{2}[0-9A-Z]$/.test(v);
      },
      message: 'La placa debe tener el formato ABC123 o ABC12D'
    }
  },
  tipo: {
    type: String,
    required: [true, 'El tipo de vehículo es obligatorio'],
    enum: ['sedan', 'suv', 'hatchback', 'pickup', 'coupe', 'convertible', 'station-wagon', 'minivan', 'crossover']
  },
  color: {
    type: String,
    required: [true, 'El color es obligatorio']
  },
  precioDia: {
    type: Number,
    required: [true, 'El precio por día es obligatorio'],
    min: [20000, 'El precio no puede ser negativo']
  },
  ubicacion: {
    ciudad: {
      type: String,
      required: true,
      default: 'Medellín'
    },
    comuna: {
      type: String,
      required: [true, 'La comuna es obligatoria']
    },
    direccion: {
      type: String,
      required: [true, 'La dirección es obligatoria']
    },
    coordenadas: {
      lat: Number,
      lng: Number
    }
  },
  caracteristicas: {
    transmision: {
      type: String,
      enum: ['manual', 'automatica', 'secuencial', 'CVT', 'doble-embrague'],
      required: true
    },
    combustible: {
      type: String,
      enum: ['gasolina', 'diesel', 'electrico', 'hibrido', 'gas-natural', 'flex'],
      required: true
    },
    pasajeros: {
      type: Number,
      required: true,
      min: 2,
      max: 9
    },
    puertas: {
      type: Number,
      required: true,
      min: 2,
      max: 5
    },
    aireAcondicionado: {
      type: Boolean,
      default: false
    },
    gps: {
      type: Boolean,
      default: false
    },
    // Nuevas características
    camaraReversa: {
      type: Boolean,
      default: false
    },
    bluetooth: {
      type: Boolean,
      default: false
    },
    sensoresParqueo: {
      type: Boolean,
      default: false
    },
    vidriosElectricos: {
      type: Boolean,
      default: false
    },
    espejosElectricos: {
      type: Boolean,
      default: false
    },
    cierrecentralizado: {
      type: Boolean,
      default: false
    },
    controlCrucero: {
      type: Boolean,
      default: false
    },
    sunroof: {
      type: Boolean,
      default: false
    },
    asientoCuero: {
      type: Boolean,
      default: false
    },
    sistemaSonido: {
      type: String,
      enum: ['basico', 'premium', 'ninguno'],
      default: 'basico'
    },
    abs: {
      type: Boolean,
      default: false
    },
    airbags: {
      type: Number,
      default: 2,
      min: 0
    }
  },
  motor: {
    cilindrada: {
      type: String, // Ej: "1.6L", "2.0L"
      trim: true
    },
    potencia: {
      type: String, // Ej: "150 HP"
      trim: true
    },
    traccion: {
      type: String,
      enum: ['delantera', 'trasera', '4x4', 'AWD'],
      default: 'delantera'
    }
  },
  documentacion: {
    soat: {
      type: String,
      required: [true, 'El SOAT es obligatorio']
    },
    tecnicomecanica: {
      type: String,
      required: [true, 'La tecnomecánica es obligatoria']
    },
    tarjetaPropiedad: {
      type: String,
      required: [true, 'La tarjeta de propiedad es obligatoria']
    }
  },
  imagenes: {
    portada: {
      type: String,
      required: [true, 'La imagen de portada es obligatoria']
    },
    galeria: [{
      url: {
        type: String,
        required: true
      },
      descripcion: {
        type: String,
        default: ''
      },
      orden: {
        type: Number,
        default: 0
      }
    }]
  },
  estado: {
    type: String,
    enum: ['disponible', 'reservado', 'mantenimiento', 'inactivo'],
    default: 'disponible'
  },
  kilometraje: {
    type: Number,
    min: [0, 'El kilometraje no puede ser negativo'],
    default: 0
  },
  descripcion: {
    type: String,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  restricciones: {
    edadMinima: {
      type: Number,
      default: 21,
      min: 18
    },
    deposito: {
      type: Number,
      default: 0,
      min: 0
    },
    kilometrajeIncluido: {
      type: Number,
      default: 200, // km por día
      min: 0
    },
    costoPorKmExtra: {
      type: Number,
      default: 500, // pesos por km
      min: 0
    }
  },
  calificacion: {
    promedio: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    cantidadReseñas: {
      type: Number,
      default: 0
    }
  },
  vistasTotal: {
    type: Number,
    default: 0
  },
  reservasTotal: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices para mejorar búsquedas
vehicleSchema.index({ estado: 1 });
vehicleSchema.index({ tipo: 1 });
vehicleSchema.index({ precioDia: 1 });
vehicleSchema.index({ 'ubicacion.comuna': 1 });
vehicleSchema.index({ marca: 1, modelo: 1 });
vehicleSchema.index({ 'caracteristicas.transmision': 1 });

// Método para incrementar vistas
vehicleSchema.methods.incrementarVistas = function() {
  this.vistasTotal += 1;
  return this.save();
};

// Método para incrementar reservas
vehicleSchema.methods.incrementarReservas = function() {
  this.reservasTotal += 1;
  return this.save();
};

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;