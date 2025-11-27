// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Users, Calendar, DollarSign, TrendingUp, Eye } from 'lucide-react';
import api from '../../services/api';
import { formatPrice } from '../../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/estadisticas');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Bienvenido al centro de control de OnWheels Rent</p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 grid-cols-2 grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Usuarios</p>
              <p className="text-3xl font-bold mt-2">{stats?.resumen.totalUsuarios || 0}</p>
              <p className="text-sm text-success mt-1">
                +{stats?.resumen.usuariosNuevosMes || 0} este mes
              </p>
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={30} color="var(--primary-600)" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Vehículos</p>
              <p className="text-3xl font-bold mt-2">{stats?.resumen.totalVehiculos || 0}</p>
              <p className="text-sm text-success mt-1">
                {stats?.resumen.vehiculosDisponibles || 0} disponibles
              </p>
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Car size={30} color="var(--success)" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Reservas Activas</p>
              <p className="text-3xl font-bold mt-2">{stats?.resumen.reservasActivas || 0}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats?.resumen.totalReservas || 0} totales
              </p>
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={30} color="var(--warning)" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Ingresos Totales</p>
              <p className="text-2xl font-bold mt-2">
                {formatPrice(stats?.resumen.ingresosTotales || 0)}
              </p>
              <p className="text-sm text-success mt-1">
                {formatPrice(stats?.resumen.ingresosMesActual || 0)} este mes
              </p>
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={30} color="var(--success)" />
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 grid-cols-3 gap-6 mb-8">
        <Link to="/admin/vehiculos" style={{ textDecoration: 'none' }}>
          <div className="card text-center" style={{ cursor: 'pointer' }}>
            <Car size={48} color="var(--primary-600)" style={{ margin: '0 auto 1rem' }} />
            <h3 className="text-xl font-semibold mb-2">Gestionar Vehículos</h3>
            <p className="text-gray-600">Crear, editar y eliminar vehículos</p>
          </div>
        </Link>

        <Link to="/admin/usuarios" style={{ textDecoration: 'none' }}>
          <div className="card text-center" style={{ cursor: 'pointer' }}>
            <Users size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
            <h3 className="text-xl font-semibold mb-2">Gestionar Usuarios</h3>
            <p className="text-gray-600">Ver y administrar usuarios</p>
          </div>
        </Link>

        <Link to="/admin/reservas" style={{ textDecoration: 'none' }}>
          <div className="card text-center" style={{ cursor: 'pointer' }}>
            <Calendar size={48} color="var(--warning)" style={{ margin: '0 auto 1rem' }} />
            <h3 className="text-xl font-semibold mb-2">Gestionar Reservas</h3>
            <p className="text-gray-600">Ver y cambiar estados</p>
          </div>
        </Link>
      </div>

      {/* Vehículos más populares */}
      {stats?.vehiculosPopulares && stats.vehiculosPopulares.length > 0 && (
        <div className="card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={24} color="var(--primary-600)" />
            <h2 className="text-2xl font-bold">Vehículos Más Populares</h2>
          </div>

          <div className="grid grid-cols-1 grid-cols-5 gap-4">
            {stats.vehiculosPopulares.map((vehicle) => (
              <div key={vehicle._id} className="card">
                <div style={{
                  width: '100%',
                  height: '120px',
                  backgroundColor: 'var(--gray-200)',
                  borderRadius: 'var(--radius)',
                  marginBottom: '1rem',
                  overflow: 'hidden'
                }}>
                  {vehicle.imagenes?.portada ? (
                    <img
                      src={vehicle.imagenes.portada}
                      alt={`${vehicle.marca} ${vehicle.modelo}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Car size={32} color="var(--gray-400)" />
                    </div>
                  )}
                </div>
                <h4 className="font-semibold mb-1">{vehicle.marca} {vehicle.modelo}</h4>
                <p className="text-sm text-gray-600">{vehicle.placa}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Eye size={14} color="var(--gray-500)" />
                  <span className="text-sm text-gray-600">{vehicle.reservasTotal} reservas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Últimas reservas */}
      {stats?.ultimasReservas && stats.ultimasReservas.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Últimas Reservas</h2>
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Vehículo</th>
                  <th>Fecha Inicio</th>
                  <th>Días</th>
                  <th>Costo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {stats.ultimasReservas.map((reservation) => (
                  <tr key={reservation._id}>
                    <td>{reservation.usuario?.nombre}</td>
                    <td>{reservation.vehiculo?.marca} {reservation.vehiculo?.modelo}</td>
                    <td>{new Date(reservation.fechaInicio).toLocaleDateString('es-CO')}</td>
                    <td>{reservation.diasReserva}</td>
                    <td className="font-semibold">{formatPrice(reservation.costoTotal)}</td>
                    <td>
                      <span className={`badge badge-${
                        reservation.estado === 'confirmada' ? 'success' : 
                        reservation.estado === 'pendiente' ? 'warning' : 'info'
                      }`}>
                        {reservation.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .grid-cols-2 {
            grid-template-columns: repeat(2, 1fr);
          }
          .grid-cols-3 {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .grid-cols-4 {
            grid-template-columns: repeat(4, 1fr);
          }
          .grid-cols-5 {
            grid-template-columns: repeat(5, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;