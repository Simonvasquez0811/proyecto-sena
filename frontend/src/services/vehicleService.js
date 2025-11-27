// src/services/vehicleService.js
import api from './api'; // Asumiendo que 'api' es tu instancia de Axios configurada

const API_ROUTE = '/vehiculos'; 

// 1. Obtener todos los vehículos (con filtros opcionales)
const getAll = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`${API_ROUTE}?${params}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener el listado de vehículos' };
  }
};

// 2. Obtener un vehículo por ID
const getById = async (id) => {
  try {
    const response = await api.get(`${API_ROUTE}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener el vehículo' };
  }
};

// 3. Crear un nuevo vehículo (Generalmente solo para Administradores)
const create = async (vehicleData) => {
  try {
    // Nota: La gestión de la autorización (token) se maneja idealmente en la instancia de 'api'
    const response = await api.post(API_ROUTE, vehicleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al crear el vehículo' };
  }
};

// 4. Actualizar un vehículo
const update = async (id, vehicleData) => {
  try {
    const response = await api.put(`${API_ROUTE}/${id}`, vehicleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al actualizar el vehículo' };
  }
};

// 5. Eliminar un vehículo
const remove = async (id) => {
  try {
    const response = await api.delete(`${API_ROUTE}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al eliminar el vehículo' };
  }
};


//  Agrupación de todas las funciones en un objeto
const vehicleService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
};

//  Exportación por defecto para resolver el error "does not provide an export named 'default'"
export default vehicleService;