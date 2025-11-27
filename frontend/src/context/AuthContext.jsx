// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar la app
  useEffect(() => {
    const loadUser = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  // Login
  const login = async (correo, contraseña) => {
    try {
      const response = await authService.login(correo, contraseña);
      setUser(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setUser(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Actualizar usuario en el contexto
  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  // Verificar si es admin
  const isAdmin = () => {
    return user && user.rol === 'administrador';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};