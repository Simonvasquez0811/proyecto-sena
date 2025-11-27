// src/pages/admin/ManageReservations.jsx
import { useState, useEffect } from 'react';
import reservationService from '../../services/reservationService';
import { Calendar, Filter, Eye, Check, X, AlertCircle } from 'lucide-react';
import { formatPrice, formatDate, getReservationStatusBadge, getReservationStatusText } from '../../utils/helpers';

const ManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [observacion, setObservacion] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [filterStatus]);

  const fetchReservations = async () => {
    try {
      const filters = filterStatus ? { estado: filterStatus } : {};
      const data = await reservationService.getAll(filters);
      setReservations(data.data);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  const handleOpenStatusModal = (reservation) => {
    setSelectedReservation(reservation);
    setNewStatus(reservation.estado);
    setObservacion('');
    setShowStatusModal(true);
  };

  const handleChangeStatus = async () => {
    try {
      await reservationService.changeStatus(selectedReservation._id, newStatus, observacion);
      setShowStatusModal(false);
      fetchReservations();
      alert('Estado actualizado exitosamente');
    } catch (error) {
      alert(error.message || 'Error al cambiar estado');
    }
  };

  const getStatusStats = () => {
    return {
      total: reservations.length,
      pendiente: reservations.filter(r => r.estado === 'pendiente').length,
      confirmada: reservations.filter(r => r.estado === 'confirmada').length,
      en_curso: reservations.filter(r => r.estado === 'en_curso').length,
      completada: reservations.filter(r => r.estado === 'completada').length,
      cancelada: reservations.filter(r => r.estado === 'cancelada').length
    };
  };

  const stats = getStatusStats();

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
          <h1 className="text-3xl font-bold">Gestionar Reservas</h1>
          <p className="text-gray-600 mt-2">Administra todas las reservas del sistema</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 grid-cols-3 grid-cols-6 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-gray-600 text-sm">Total</p>
          <p className="text-3xl font-bold text-primary-600">{stats.total}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 text-sm">Pendientes</p>
          <p className="text-3xl font-bold text-warning">{stats.pendiente}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 text-sm">Confirmadas</p>
          <p className="text-3xl font-bold text-info">{stats.confirmada}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 text-sm">En Curso</p>
          <p className="text-3xl font-bold text-success">{stats.en_curso}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 text-sm">Completadas</p>
          <p className="text-3xl font-bold text-success">{stats.completada}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 text-sm">Canceladas</p>
          <p className="text-3xl font-bold text-danger">{stats.cancelada}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <Filter size={20} color="var(--primary-600)" />
          <div style={{ flex: 1 }}>
            <label className="form-label">Filtrar por Estado</label>
            <select
              className="input-field"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmada">Confirmadas</option>
              <option value="en_curso">En Curso</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de reservas */}
      <div className="card">
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Vehículo</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Días</th>
                <th>Costo Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation._id}>
                  <td className="font-mono text-sm">
                    {reservation._id.substring(0, 8)}...
                  </td>
                  <td>
                    <div className="font-semibold">{reservation.usuario?.nombre}</div>
                    <div className="text-sm text-gray-600">{reservation.usuario?.correo}</div>
                  </td>
                  <td>
                    <div className="font-semibold">
                      {reservation.vehiculo?.marca} {reservation.vehiculo?.modelo}
                    </div>
                    <div className="text-sm text-gray-600 font-mono">
                      {reservation.vehiculo?.placa}
                    </div>
                  </td>
                  <td className="text-sm">{formatDate(reservation.fechaInicio)}</td>
                  <td className="text-sm">{formatDate(reservation.fechaFin)}</td>
                  <td className="text-center font-semibold">{reservation.diasReserva}</td>
                  <td className="font-bold text-primary-600">
                    {formatPrice(reservation.costoTotal)}
                  </td>
                  <td>
                    <span className={`badge ${getReservationStatusBadge(reservation.estado)}`}>
                      {getReservationStatusText(reservation.estado)}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenDetail(reservation)}
                        className="btn btn-sm"
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'var(--primary-100)',
                          color: 'var(--primary-700)'
                        }}
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenStatusModal(reservation)}
                        className="btn btn-sm btn-primary"
                        style={{ padding: '0.5rem' }}
                        title="Cambiar estado"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reservations.length === 0 && (
          <div className="text-center py-8">
            <Calendar size={64} color="var(--gray-400)" style={{ margin: '0 auto 1rem' }} />
            <p className="text-gray-600">No hay reservas para mostrar</p>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {showDetailModal && selectedReservation && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h2 className="text-2xl font-bold mb-4">Detalle de Reserva</h2>

            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Usuario</h3>
              <p><strong>Nombre:</strong> {selectedReservation.usuario?.nombre}</p>
              <p><strong>Correo:</strong> {selectedReservation.usuario?.correo}</p>
              <p><strong>Teléfono:</strong> {selectedReservation.usuario?.telefono}</p>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Vehículo</h3>
              <p><strong>Modelo:</strong> {selectedReservation.vehiculo?.marca} {selectedReservation.vehiculo?.modelo}</p>
              <p><strong>Placa:</strong> {selectedReservation.vehiculo?.placa}</p>
              <p><strong>Precio/día:</strong> {formatPrice(selectedReservation.vehiculo?.precioDia)}</p>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Detalles de la Reserva</h3>
              <p><strong>Fecha inicio:</strong> {formatDate(selectedReservation.fechaInicio)}</p>
              <p><strong>Fecha fin:</strong> {formatDate(selectedReservation.fechaFin)}</p>
              <p><strong>Días:</strong> {selectedReservation.diasReserva}</p>
              <p><strong>Costo total:</strong> {formatPrice(selectedReservation.costoTotal)}</p>
              <p><strong>Estado:</strong> <span className={`badge ${getReservationStatusBadge(selectedReservation.estado)}`}>
                {getReservationStatusText(selectedReservation.estado)}
              </span></p>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Ubicaciones</h3>
              <p><strong>Lugar de entrega:</strong> {selectedReservation.lugarEntrega}</p>
              <p><strong>Lugar de devolución:</strong> {selectedReservation.lugarDevolucion}</p>
            </div>

            {selectedReservation.notas && (
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">Notas</h3>
                <p className="text-gray-600">{selectedReservation.notas}</p>
              </div>
            )}

            {selectedReservation.historialEstados && selectedReservation.historialEstados.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">Historial de Estados</h3>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {selectedReservation.historialEstados.map((item, index) => (
                    <div key={index} className="mb-2 p-2" style={{ backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                      <div className="flex justify-between">
                        <span className={`badge ${getReservationStatusBadge(item.estado)}`}>
                          {getReservationStatusText(item.estado)}
                        </span>
                        <span className="text-sm text-gray-600">{formatDate(item.fecha)}</span>
                      </div>
                      {item.observacion && (
                        <p className="text-sm text-gray-600 mt-1">{item.observacion}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setShowDetailModal(false)} className="btn btn-secondary w-full">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de cambio de estado */}
      {showStatusModal && selectedReservation && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Cambiar Estado de Reserva</h2>

            <div className="form-group">
              <label className="form-label">Nuevo Estado</label>
              <select
                className="input-field"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="en_curso">En Curso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Observación (Opcional)</label>
              <textarea
                className="input-field"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Agrega una nota sobre este cambio..."
                rows="3"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowStatusModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangeStatus}
                className="btn btn-primary flex-1"
              >
                Actualizar Estado
              </button>
            </div>
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
          .grid-cols-6 {
            grid-template-columns: repeat(6, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default ManageReservations;