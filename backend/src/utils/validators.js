// src/utils/validators.js

// Validar formato de placa colombiana (ABC123 o ABC12D)
const validarPlaca = (placa) => {
  const regex = /^[A-Z]{3}[0-9]{2}[0-9A-Z]$/;
  return regex.test(placa);
};

// Validar formato de cédula colombiana (6-10 dígitos)
const validarCedula = (cedula) => {
  const regex = /^[0-9]{6,10}$/;
  return regex.test(cedula);
};

// Validar formato de licencia de conducción
const validarLicencia = (licencia) => {
  const regex = /^[A-Z]-[0-9]{8}$/;
  return regex.test(licencia);
};

// Validar formato de teléfono colombiano (10 dígitos, empieza con 3)
const validarTelefono = (telefono) => {
  const regex = /^3[0-9]{9}$/;
  return regex.test(telefono);
};

// Validar que la fecha sea futura
const esFechaFutura = (fecha) => {
  const fechaDate = new Date(fecha);
  const ahora = new Date();
  return fechaDate > ahora;
};

// Validar rango de fechas
const validarRangoFechas = (fechaInicio, fechaFin) => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  return fin > inicio;
};

// Calcular días entre dos fechas
const calcularDias = (fechaInicio, fechaFin) => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diferencia = fin - inicio;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
};

// Validar edad mínima (a partir de la fecha de nacimiento)
const validarEdadMinima = (fechaNacimiento, edadMinima) => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad >= edadMinima;
};

// Sanitizar texto (eliminar caracteres especiales)
const sanitizarTexto = (texto) => {
  return texto.trim().replace(/[<>]/g, '');
};

// Validar URL
const validarURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Formatear número de teléfono
const formatearTelefono = (telefono) => {
  const limpio = telefono.replace(/\D/g, '');
  if (limpio.length === 10) {
    return `(${limpio.slice(0, 3)}) ${limpio.slice(3, 6)}-${limpio.slice(6)}`;
  }
  return telefono;
};

// Formatear precio (agregar separadores de miles)
const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(precio);
};

module.exports = {
  validarPlaca,
  validarCedula,
  validarLicencia,
  validarTelefono,
  esFechaFutura,
  validarRangoFechas,
  calcularDias,
  validarEdadMinima,
  sanitizarTexto,
  validarURL,
  formatearTelefono,
  formatearPrecio
};