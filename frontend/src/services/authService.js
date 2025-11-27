// src/services/authService.js
import api from './api';

// Registrar nuevo usuario
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/registro', userData);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al registrar usuario' };
  }
};

// Iniciar sesión
export const login = async (correo, contraseña) => {
  try {
    const response = await api.post('/auth/login', { correo, contraseña });
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al iniciar sesión' };
  }
};

// Cerrar sesión
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Obtener perfil del usuario
export const getProfile = async () => {
  try {
    const response = await api.get('/auth/perfil');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener perfil' };
  }
};

// Actualizar perfil
export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/auth/perfil', userData);
    if (response.data.success && response.data.data) {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...currentUser, ...response.data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al actualizar perfil' };
  }
};

// Obtener usuario actual del localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Verificar si hay un token válido
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Verificar si el usuario es administrador
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.rol === 'administrador';
};

const authService = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  getCurrentUser,
  isAuthenticated,
  isAdmin
};

export default authService;