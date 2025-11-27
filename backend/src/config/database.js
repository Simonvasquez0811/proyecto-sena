// src/config/database.js (CORREGIDO)
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Estas opciones obsoletas se eliminan en las versiones recientes de Mongoose
    const conn = await mongoose.connect(process.env.MONGODB_URI); // Debe ser MONGO_URI, no MONGODB_URI

    console.log(` MongoDB Conectado: ${conn.connection.host}`);
    console.log(` Base de datos: ${conn.connection.name}`);
  } catch (error) {
    console.error(` Error de conexión a MongoDB: ${error.message}`);
    process.exit(1); // Salir con error
  }
};

module.exports = connectDB;