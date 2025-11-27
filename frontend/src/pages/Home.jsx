// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import vehicleService from '../services/vehicleService';
import { Car, Shield, Clock, DollarSign, Users, Fuel, Settings, ArrowRight } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedVehicles();
  }, []);

  const fetchFeaturedVehicles = async () => {
    try {
      const data = await vehicleService.getAll({ limite: 6, ordenar: 'popular' });
      setFeaturedVehicles(data.data);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Car size={40} />,
      title: 'Amplia Variedad',
      description: 'Encuentra el vehículo perfecto para cada ocasión'
    },
    {
      icon: <Shield size={40} />,
      title: 'Seguridad Garantizada',
      description: 'Todos nuestros vehículos están verificados y asegurados'
    },
    {
      icon: <Clock size={40} />,
      title: 'Reserva Rápida',
      description: 'Proceso de reserva simple y en minutos'
    },
    {
      icon: <DollarSign size={40} />,
      title: 'Mejores Precios',
      description: 'Tarifas competitivas y transparentes'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: isAuthenticated 
          ? 'linear-gradient(135deg, var(--success) 0%, #059669 100%)'
          : 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
        color: 'white',
        padding: '4rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          {isAuthenticated ? (
            <>
              <h1 className="text-4xl font-bold mb-4 animate-fadeIn">
                ¡Bienvenido de nuevo, {user?.nombre}! 👋
              </h1>
              <p className="text-xl mb-8" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
                {user?.rol === 'administrador' 
                  ? 'Gestiona tu plataforma desde el panel de administración'
                  : 'Explora nuestros vehículos y encuentra el perfecto para ti'}
              </p>
              <div className="flex gap-4 justify-center" style={{ flexWrap: 'wrap' }}>
                {user?.rol === 'administrador' ? (
                  <>
                    <Link to="/admin/dashboard" className="btn btn-lg" style={{
                      backgroundColor: 'white',
                      color: 'var(--success)'
                    }}>
                      Ir al Dashboard
                    </Link>
                    <Link to="/vehiculos" className="btn btn-lg" style={{
                      backgroundColor: 'transparent',
                      border: '2px solid white',
                      color: 'white'
                    }}>
                      Ver Vehículos
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/vehiculos" className="btn btn-lg" style={{
                      backgroundColor: 'white',
                      color: 'var(--success)'
                    }}>
                      Explorar Vehículos
                    </Link>
                    <Link to="/mis-reservas" className="btn btn-lg" style={{
                      backgroundColor: 'transparent',
                      border: '2px solid white',
                      color: 'white'
                    }}>
                      Mis Reservas
                    </Link>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-4 animate-fadeIn">
                Alquila el Vehículo Perfecto en Medellín
              </h1>
              <p className="text-xl mb-8" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
                La forma más fácil y segura de alquilar vehículos. 
                Encuentra autos de calidad al mejor precio.
              </p>
              <div className="flex gap-4 justify-center" style={{ flexWrap: 'wrap' }}>
                <Link to="/vehiculos" className="btn btn-lg" style={{
                  backgroundColor: 'white',
                  color: 'var(--primary-600)'
                }}>
                  Explorar Vehículos
                </Link>
                <Link to="/register" className="btn btn-lg" style={{
                  backgroundColor: 'transparent',
                  border: '2px solid white',
                  color: 'white'
                }}>
                  Registrarse Gratis
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Vehículos Destacados */}
      <section className="py-8">
        <div className="container">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold">Vehículos Destacados</h2>
              <p className="text-gray-600 mt-2">Los más populares de nuestra flota</p>
            </div>
            <Link to="/vehiculos" className="btn btn-primary">
              Ver Todos
              <ArrowRight size={20} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 grid-cols-2 grid-cols-3 gap-6">
              {featuredVehicles.slice(0, 6).map((vehicle) => (
                <Link
                  key={vehicle._id}
                  to={`/vehiculos/${vehicle._id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="card">
                    <div style={{
                      width: '100%',
                      height: '200px',
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
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Car size={48} color="var(--gray-400)" />
                        </div>
                      )}
                    </div>

                    <div className="badge badge-info mb-2">
                      {vehicle.tipo}
                    </div>

                    <h3 className="text-xl font-semibold mb-2">
                      {vehicle.marca} {vehicle.modelo}
                    </h3>

                    <p className="text-gray-600 mb-4">
                      {vehicle.año} • {vehicle.color}
                    </p>

                    <div className="flex gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        {vehicle.caracteristicas?.pasajeros}
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings size={16} />
                        {vehicle.caracteristicas?.transmision}
                      </div>
                      <div className="flex items-center gap-1">
                        <Fuel size={16} />
                        {vehicle.caracteristicas?.combustible}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-primary-600">
                          {formatPrice(vehicle.precioDia)}
                        </div>
                        <div className="text-sm text-gray-600">por día</div>
                      </div>
                      <div className={`badge ${
                        vehicle.estado === 'disponible' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {vehicle.estado}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8">
            ¿Por qué elegir OnWheels Rent?
          </h2>
          <div className="grid grid-cols-1 grid-cols-2 grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card text-center animate-fadeIn" style={{
                animationDelay: `${index * 0.1}s`
              }}>
                <div style={{
                  color: 'var(--primary-600)',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8">
        <div className="container">
          <div className="grid grid-cols-1 grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                100+
              </div>
              <div className="text-gray-600">
                Vehículos Disponibles
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                500+
              </div>
              <div className="text-gray-600">
                Clientes Satisfechos
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                24/7
              </div>
              <div className="text-gray-600">
                Soporte Disponible
              </div>
            </div>
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section style={{
          backgroundColor: 'var(--gray-100)',
          padding: '4rem 0',
          textAlign: 'center'
        }}>
          <div className="container">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl mb-6 text-gray-600">
              Únete a cientos de usuarios que ya confían en nosotros
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Crear Cuenta Gratis
            </Link>
          </div>
        </section>
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
        }
      `}</style>
    </div>
  );
};

export default Home;