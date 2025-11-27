// src/pages/MyReservations.jsx
import { useState, useEffect } from 'react';
import reservationService from '../services/reservationService';
import { Calendar, Car, Clock, DollarSign } from 'lucide-react';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReservations();
  }, []);

  const fetchMyReservations = async () => {
    try {
      const data = await reservationService.getMyReservations();
      setReservations(data.data);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pendiente: 'badge-warning',
      confirmada: 'badge-info',
      en_curso: 'badge-success',
      completada: 'badge-success',
      cancelada: 'badge-danger'
    };
    return badges[status] || 'badge-gray';
  };

  const getStatusText = (status) => {
    const texts = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      en_curso: 'En Curso',
      completada: 'Completada',
      cancelada: 'Cancelada'
    };
    return texts[status] || status;
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
      <h1 className="text-3xl font-bold mb-6">Mis Reservas</h1>

      {reservations.length === 0 ? (
        <div className="card text-center py-8">
          <Car size={64} color="var(--gray-400)" style={{ margin: '0 auto 1rem' }} />
          <h3 className="text-xl font-semibold mb-2">No tienes reservas</h3>
          <p className="text-gray-600 mb-4">Explora nuestros vehículos y haz tu primera reserva</p>
          <a href="/vehiculos" className="btn btn-primary">
            Ver Vehículos
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {reservations.map((reservation) => (
            <div key={reservation._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {reservation.vehiculo?.marca} {reservation.vehiculo?.modelo}
                  </h3>
                  <p className="text-gray-600">
                    Placa: {reservation.vehiculo?.placa}
                  </p>
                </div>
                <div className={`badge ${getStatusBadge(reservation.estado)}`}>
                  {getStatusText(reservation.estado)}
                </div>
              </div>

              <div className="grid grid-cols-1 grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={18} />
                  <div>
                    <div className="text-sm">Fecha de inicio</div>
                    <div className="font-medium text-gray-900">
                      {formatDate(reservation.fechaInicio)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={18} />
                  <div>
                    <div className="text-sm">Fecha de fin</div>
                    <div className="font-medium text-gray-900">
                      {formatDate(reservation.fechaFin)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={18} />
                  <div>
                    <div className="text-sm">Días de reserva</div>
                    <div className="font-medium text-gray-900">
                      {reservation.diasReserva} días
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign size={18} />
                  <div>
                    <div className="text-sm">Costo total</div>
                    <div className="font-medium text-primary-600 text-lg">
                      {formatPrice(reservation.costoTotal)}
                    </div>
                  </div>
                </div>
              </div>

              {reservation.notas && (
                <div className="mt-4 p-4" style={{
                  backgroundColor: 'var(--gray-50)',
                  borderRadius: 'var(--radius)'
                }}>
                  <div className="text-sm font-medium text-gray-700 mb-1">Notas:</div>
                  <p className="text-gray-600">{reservation.notas}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .grid-cols-2 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default MyReservations;