// src/services/reservationService.js
import api from './api';

// Crear reserva
export const create = async (reservationData) => {
  try {
    const response = await api.post('/reservas', reservationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al crear reserva' };
  }
};

// Obtener todas las reservas (con filtros)
export const getAll = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/reservas?${params}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener reservas' };
  }
};

// Obtener mis reservas
export const getMyReservations = async () => {
  try {
    const response = await api.get('/reservas/mis-reservas');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener mis reservas' };
  }
};

// Obtener reserva por ID
export const getById = async (id) => {
  try {
    const response = await api.get(`/reservas/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener reserva' };
  }
};

// Editar reserva (cambiar fechas)
export const update = async (id, reservationData) => {
  try {
    const response = await api.put(`/reservas/${id}`, reservationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al actualizar reserva' };
  }
};

// Cancelar reserva
export const cancel = async (id) => {
  try {
    const response = await api.delete(`/reservas/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al cancelar reserva' };
  }
};

// Cambiar estado (Admin)
export const changeStatus = async (id, estado, observacion = '') => {
  try {
    const response = await api.patch(`/reservas/${id}/estado`, { estado, observacion });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al cambiar estado' };
  }
};

// Obtener estadísticas (Admin)
export const getStatistics = async () => {
  try {
    const response = await api.get('/reservas/estadisticas');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener estadísticas' };
  }
};

const reservationService = {
  create,
  getAll,
  getMyReservations,
  getById,
  update,
  cancel,
  changeStatus,
  getStatistics
};

export default reservationService;