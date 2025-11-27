// src/pages/VehicleDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import vehicleService from '../services/vehicleService';
import reservationService from '../services/reservationService';
import { Car, Users, Fuel, Settings, Calendar, MapPin, Check, AlertCircle } from 'lucide-react';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveData, setReserveData] = useState({
    fechaInicio: '',
    fechaFin: '',
    lugarEntrega: '',
    lugarDevolucion: '',
    notas: ''
  });
  const [reserveLoading, setReserveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const data = await vehicleService.getById(id);
      setVehicle(data.data);
    } catch (error) {
      console.error('Error al cargar vehículo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowReserveModal(true);
  };

  const handleReserveSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setReserveLoading(true);

    try {
      await reservationService.create({
        vehiculo: vehicle._id,
        ...reserveData
      });
      setSuccess('¡Reserva creada exitosamente!');
      setTimeout(() => {
        navigate('/mis-reservas');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al crear reserva');
    } finally {
      setReserveLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
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

  if (!vehicle) {
    return (
      <div className="container py-8">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-2">Vehículo no encontrado</h2>
          <button onClick={() => navigate('/vehiculos')} className="btn btn-primary">
            Volver a vehículos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <button onClick={() => navigate('/vehiculos')} className="btn btn-secondary mb-6">
        ← Volver
      </button>

      <div className="grid grid-cols-1 grid-cols-2 gap-6">
        {/* Imagen Principal y Galería */}
        <div>
          {/* Imagen Principal */}
          <div style={{
            width: '100%',
            height: '400px',
            backgroundColor: 'var(--gray-200)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}>
            {vehicle.imagenes?.portada ? (
              <img
                src={vehicle.imagenes.portada}
                alt={`${vehicle.marca} ${vehicle.modelo}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Car size={80} color="var(--gray-400)" />
              </div>
            )}
          </div>

          {/* Galería de Imágenes */}
          {vehicle.imagenes?.galeria && vehicle.imagenes.galeria.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Más imágenes</h3>
              <div className="grid grid-cols-3 gap-2">
                {vehicle.imagenes.galeria.map((imagen, index) => (
                  <div
                    key={index}
                    style={{
                      width: '100%',
                      height: '120px',
                      backgroundColor: 'var(--gray-200)',
                      borderRadius: 'var(--radius)',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      // Cambiar imagen principal al hacer clic
                      const temp = vehicle.imagenes.portada;
                      vehicle.imagenes.portada = imagen.url;
                      imagen.url = temp;
                      setVehicle({...vehicle});
                    }}
                  >
                    <img
                      src={imagen.url}
                      alt={imagen.descripcion || `Imagen ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Información */}
        <div>
          <div className="card">
            <div className={`badge ${vehicle.estado === 'disponible' ? 'badge-success' : 'badge-warning'} mb-2`}>
              {vehicle.estado}
            </div>

            <h1 className="text-3xl font-bold mb-2">
              {vehicle.marca} {vehicle.modelo}
            </h1>

            <p className="text-xl text-gray-600 mb-4">
              {vehicle.año} • {vehicle.color}
            </p>

            <div className="text-3xl font-bold text-primary-600 mb-6">
              {formatPrice(vehicle.precioDia)}
              <span className="text-lg text-gray-600 font-normal"> / día</span>
            </div>

            {/* Características */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Users size={20} color="var(--primary-600)" />
                <span>{vehicle.caracteristicas?.pasajeros} pasajeros</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings size={20} color="var(--primary-600)" />
                <span>{vehicle.caracteristicas?.transmision}</span>
              </div>
              <div className="flex items-center gap-2">
                <Fuel size={20} color="var(--primary-600)" />
                <span>{vehicle.caracteristicas?.combustible}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={20} color="var(--primary-600)" />
                <span>{vehicle.ubicacion?.comuna}</span>
              </div>
            </div>

            {vehicle.descripcion && (
              <p className="text-gray-600 mb-6">{vehicle.descripcion}</p>
            )}

            {vehicle.estado === 'disponible' && (
              <button onClick={handleReserve} className="btn btn-primary w-full btn-lg">
                <Calendar size={20} />
                Reservar Ahora
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Reserva */}
      {showReserveModal && (
        <div className="modal-overlay" onClick={() => setShowReserveModal(false)}>
          <div className="modal animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Reservar Vehículo</h2>

            {error && (
              <div className="alert alert-danger mb-4">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success mb-4">
                <Check size={20} />
                {success}
              </div>
            )}

            <form onSubmit={handleReserveSubmit}>
              <div className="form-group">
                <label className="form-label">Fecha de Inicio</label>
                <input
                  type="date"
                  className="input-field"
                  value={reserveData.fechaInicio}
                  onChange={(e) => setReserveData({ ...reserveData, fechaInicio: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fecha de Fin</label>
                <input
                  type="date"
                  className="input-field"
                  value={reserveData.fechaFin}
                  onChange={(e) => setReserveData({ ...reserveData, fechaFin: e.target.value })}
                  min={reserveData.fechaInicio}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lugar de Entrega</label>
                <input
                  type="text"
                  className="input-field"
                  value={reserveData.lugarEntrega}
                  onChange={(e) => setReserveData({ ...reserveData, lugarEntrega: e.target.value })}
                  placeholder="Dirección de entrega"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lugar de Devolución</label>
                <input
                  type="text"
                  className="input-field"
                  value={reserveData.lugarDevolucion}
                  onChange={(e) => setReserveData({ ...reserveData, lugarDevolucion: e.target.value })}
                  placeholder="Dirección de devolución"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notas (Opcional)</label>
                <textarea
                  className="input-field"
                  value={reserveData.notas}
                  onChange={(e) => setReserveData({ ...reserveData, notas: e.target.value })}
                  placeholder="Alguna indicación especial..."
                  rows="3"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowReserveModal(false)}
                  className="btn btn-secondary flex-1"
                  disabled={reserveLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={reserveLoading}
                >
                  {reserveLoading ? (
                    <>
                      <div className="spinner spinner-sm"></div>
                      Reservando...
                    </>
                  ) : (
                    'Confirmar Reserva'
                  )}
                </button>
              </div>
            </form>
          </div>
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

export default VehicleDetail;