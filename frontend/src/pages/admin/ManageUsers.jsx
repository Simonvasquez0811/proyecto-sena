// src/pages/admin/ManageUsers.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Shield, UserCheck, UserX, Trash2, RefreshCw } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (filterRole) params.rol = filterRole;
      if (filterStatus) params.activo = filterStatus;

      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/usuarios?${queryString}`);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`¿Cambiar rol a ${newRole}?`)) return;

    try {
      await api.patch(`/usuarios/${userId}/rol`, { rol: newRole });
      fetchUsers();
      alert('Rol actualizado exitosamente');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al cambiar rol');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/usuarios/${userId}/estado`, { activo: !currentStatus });
      fetchUsers();
      alert(currentStatus ? 'Usuario desactivado' : 'Usuario activado');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const handleResetAttempts = async (userId) => {
    if (!window.confirm('¿Resetear intentos fallidos y desbloquear cuenta?')) return;

    try {
      await api.patch(`/usuarios/${userId}/resetear-intentos`);
      fetchUsers();
      alert('Cuenta desbloqueada exitosamente');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al resetear intentos');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

    try {
      await api.delete(`/usuarios/${userId}`);
      fetchUsers();
      alert('Usuario eliminado exitosamente');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.correo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestionar Usuarios</h1>
          <p className="text-gray-600 mt-2">Administra los usuarios del sistema</p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 grid-cols-3 gap-4">
          <div>
            <label className="form-label">
              <Search size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Buscar
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Filtrar por Rol</label>
            <select
              className="input-field"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="usuario">Usuarios</option>
              <option value="administrador">Administradores</option>
            </select>
          </div>

          <div>
            <label className="form-label">Filtrar por Estado</label>
            <select
              className="input-field"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-gray-600 text-sm">Total Usuarios</p>
          <p className="text-3xl font-bold text-primary-600">{users.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 text-sm">Administradores</p>
          <p className="text-3xl font-bold text-danger">
            {users.filter(u => u.rol === 'administrador').length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 text-sm">Activos</p>
          <p className="text-3xl font-bold text-success">
            {users.filter(u => u.activo).length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 text-sm">Verificados</p>
          <p className="text-3xl font-bold text-info">
            {users.filter(u => u.verificado).length}
          </p>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="card">
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: 'var(--primary-600)'
                      }}>
                        {user.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{user.nombre}</div>
                        {user.verificado && (
                          <div className="flex items-center gap-1 text-xs text-success">
                            <UserCheck size={12} />
                            Verificado
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{user.correo}</td>
                  <td>{user.telefono}</td>
                  <td>
                    <select
                      value={user.rol}
                      onChange={(e) => handleChangeRole(user._id, e.target.value)}
                      className="input-field"
                      style={{ 
                        padding: '0.5rem',
                        fontSize: '0.875rem',
                        backgroundColor: user.rol === 'administrador' ? 'var(--danger)' : 'var(--primary-100)',
                        color: user.rol === 'administrador' ? 'white' : 'var(--primary-700)',
                        fontWeight: 600,
                        border: 'none'
                      }}
                    >
                      <option value="usuario">Usuario</option>
                      <option value="administrador">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(user._id, user.activo)}
                      className={`badge ${user.activo ? 'badge-success' : 'badge-danger'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </button>
                    {user.bloqueadoHasta && new Date(user.bloqueadoHasta) > new Date() && (
                      <div className="badge badge-warning mt-1" style={{ fontSize: '0.75rem' }}>
                        Bloqueado
                      </div>
                    )}
                  </td>
                  <td className="text-sm text-gray-600">
                    {formatDate(user.createdAt)}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {user.intentosFallidos > 0 && (
                        <button
                          onClick={() => handleResetAttempts(user._id)}
                          className="btn btn-sm"
                          style={{ 
                            padding: '0.5rem',
                            backgroundColor: 'var(--warning)',
                            color: 'white'
                          }}
                          title="Resetear intentos fallidos"
                        >
                          <RefreshCw size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="btn btn-sm btn-danger"
                        style={{ padding: '0.5rem' }}
                        title="Eliminar usuario"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <Users size={64} color="var(--gray-400)" style={{ margin: '0 auto 1rem' }} />
            <p className="text-gray-600">No se encontraron usuarios</p>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .grid-cols-3 {
            grid-template-columns: repeat(3, 1fr);
          }
          .grid-cols-4 {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default ManageUsers;