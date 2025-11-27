// src/pages/Vehicles.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import vehicleService from '../services/vehicleService';
import { Search, Filter, Car, Users, Fuel, Settings } from 'lucide-react';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    tipo: '',
    transmision: '',
    precioMax: '',
    pasajeros: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getAll(filters);
      setVehicles(data.data);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      tipo: '',
      transmision: '',
      precioMax: '',
      pasajeros: ''
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Explora Nuestros Vehículos</h1>
        <p className="text-xl text-gray-600">
          Encuentra el auto perfecto para tu próximo viaje
        </p>
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={24} color="var(--primary-600)" />
          <h2 className="text-xl font-semibold">Filtros de Búsqueda</h2>
        </div>

        <div className="grid grid-cols-1 grid-cols-2 grid-cols-4 gap-4">
          <div>
            <label className="form-label">Tipo de Vehículo</label>
            <select
              name="tipo"
              className="input-field"
              value={filters.tipo}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="hatchback">Hatchback</option>
              <option value="pickup">Pickup</option>
              <option value="coupe">Coupe</option>
            </select>
          </div>

          <div>
            <label className="form-label">Transmisión</label>
            <select
              name="transmision"
              className="input-field"
              value={filters.transmision}
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
              <option value="manual">Manual</option>
              <option value="automatica">Automática</option>
              <option value="CVT">CVT</option>
            </select>
          </div>

          <div>
            <label className="form-label">Precio Máximo</label>
            <input
              type="number"
              name="precioMax"
              className="input-field"
              placeholder="150000"
              value={filters.precioMax}
              onChange={handleFilterChange}
            />
          </div>

          <div>
            <label className="form-label">Pasajeros Mínimos</label>
            <select
              name="pasajeros"
              className="input-field"
              value={filters.pasajeros}
              onChange={handleFilterChange}
            >
              <option value="">Cualquiera</option>
              <option value="2">2+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
              <option value="7">7+</option>
            </select>
          </div>
        </div>

        <button onClick={clearFilters} className="btn btn-secondary btn-sm mt-4">
          Limpiar Filtros
        </button>
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="spinner"></div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-8">
          <Car size={64} color="var(--gray-400)" style={{ margin: '0 auto 1rem' }} />
          <h3 className="text-2xl font-semibold mb-2">No hay vehículos disponibles</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-600">
              Mostrando <strong>{vehicles.length}</strong> vehículos disponibles
            </p>
          </div>

          <div className="grid grid-cols-1 grid-cols-2 grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle._id}
                to={`/vehiculos/${vehicle._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="card">
                  {/* Imagen */}
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
                        <Car size={48} color="var(--gray-400)" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="badge badge-info mb-2">
                    {vehicle.tipo}
                  </div>

                  <h3 className="text-xl font-semibold mb-2">
                    {vehicle.marca} {vehicle.modelo}
                  </h3>

                  <p className="text-gray-600 mb-4">
                    {vehicle.año} • {vehicle.color}
                  </p>

                  {/* Características */}
                  <div className="flex gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      {vehicle.caracteristicas?.pasajeros} pasajeros
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

                  {/* Precio */}
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
        </>
      )}

      <style>{`
        @media (min-width: 768px) {
          .grid-cols-2 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
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

export default Vehicles;