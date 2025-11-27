// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Crear aplicación Express
const app = express();

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors()); // Permitir peticiones desde cualquier origen
app.use(express.json()); // Parsear JSON en el body de las peticiones
app.use(express.urlencoded({ extended: true })); // Parsear datos de formularios

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a la API de OnWheels Rent',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      vehiculos: '/api/vehiculos',
      reservas: '/api/reservas',
      usuarios: '/api/usuarios',
      dashboard: '/api/dashboard'
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/vehiculos', vehicleRoutes);
app.use('/api/reservas', reservationRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Puerto y arranque del servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`

  OnWheels Rent API Server
  Servidor corriendo en puerto ${PORT}   
  Entorno: ${process.env.NODE_ENV || 'development'}          
  http://localhost:${PORT}              
  
  `);
});