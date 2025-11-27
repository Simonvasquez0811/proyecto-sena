// src/utils/helpers.js

// Formatear precio en pesos colombianos
export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
};

// Formatear fecha
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Formatear fecha corta
export const formatDateShort = (date) => {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Obtener badge de estado de reserva
export const getReservationStatusBadge = (status) => {
  const badges = {
    pendiente: 'badge-warning',
    confirmada: 'badge-info',
    en_curso: 'badge-success',
    completada: 'badge-success',
    cancelada: 'badge-danger'
  };
  return badges[status] || 'badge-gray';
};

// Obtener texto de estado de reserva
export const getReservationStatusText = (status) => {
  const texts = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    en_curso: 'En Curso',
    completada: 'Completada',
    cancelada: 'Cancelada'
  };
  return texts[status] || status;
};

// Obtener badge de estado de vehículo
export const getVehicleStatusBadge = (status) => {
  const badges = {
    disponible: 'badge-success',
    reservado: 'badge-warning',
    mantenimiento: 'badge-danger',
    inactivo: 'badge-gray'
  };
  return badges[status] || 'badge-gray';
};

// Calcular días entre dos fechas
export const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Validar formato de correo
export const isValidEmail = (email) => {
  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(email);
};

// Validar formato de placa colombiana
export const isValidPlate = (plate) => {
  const regex = /^[A-Z]{3}[0-9]{2}[0-9A-Z]$/;
  return regex.test(plate);
};

// Obtener URL de imagen placeholder
export const getPlaceholderImage = (type = 'car') => {
  const placeholders = {
    car: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400',
    profile: 'https://ui-avatars.com/api/?name=User&background=0ea5e9&color=fff&size=200'
  };
  return placeholders[type] || placeholders.car;
};

// Truncar texto
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};