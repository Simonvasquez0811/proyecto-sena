// src/pages/admin/ManageVehicles.jsx
import { useState, useEffect } from 'react';
import vehicleService from '../../services/vehicleService';
import api from '../../services/api';
import { Car, Plus, Edit, Trash2, Eye, AlertCircle, Check, X } from 'lucide-react';
import { formatPrice, getVehicleStatusBadge } from '../../utils/helpers';

const ManageVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    año: new Date().getFullYear(),
    placa: '',
    tipo: 'sedan',
    color: '',
    precioDia: '',
    ubicacion: {
      ciudad: 'Medellín',
      comuna: '',
      direccion: ''
    },
    caracteristicas: {
      transmision: 'manual',
      combustible: 'gasolina',
      pasajeros: 4,
      puertas: 4,
      aireAcondicionado: false,
      gps: false
    },
    documentacion: {
      soat: 'https://example.com/soat.pdf',
      tecnicomecanica: 'https://example.com/tecno.pdf',
      tarjetaPropiedad: 'https://example.com/propiedad.pdf'
    },
    imagenes: {
      portada: '',
      galeria: []
    },
    descripcion: '',
    kilometraje: 0
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageDesc, setNewImageDesc] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      // Admin ve TODOS los vehículos sin importar el estado
      const response = await api.get('/vehiculos?estado=');
      setVehicles(response.data.data);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData(vehicle);
    } else {
      setEditingVehicle(null);
      setFormData({
        marca: '',
        modelo: '',
        año: new Date().getFullYear(),
        placa: '',
        tipo: 'sedan',
        color: '',
        precioDia: '',
        ubicacion: {
          ciudad: 'Medellín',
          comuna: '',
          direccion: ''
        },
        caracteristicas: {
          transmision: 'manual',
          combustible: 'gasolina',
          pasajeros: 4,
          puertas: 4,
          aireAcondicionado: false,
          gps: false
        },
        documentacion: {
          soat: 'https://example.com/soat.pdf',
          tecnicomecanica: 'https://example.com/tecno.pdf',
          tarjetaPropiedad: 'https://example.com/propiedad.pdf'
        },
        imagenes: {
          portada: '',
          galeria: []
        },
        descripcion: '',
        kilometraje: 0
      });
    }
    setNewImageUrl('');
    setNewImageDesc('');
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleAddImageToGallery = () => {
    if (!newImageUrl) {
      alert('Por favor ingresa una URL de imagen');
      return;
    }

    const newImage = {
      url: newImageUrl,
      descripcion: newImageDesc || '',
      orden: formData.imagenes.galeria.length
    };

    setFormData({
      ...formData,
      imagenes: {
        ...formData.imagenes,
        galeria: [...formData.imagenes.galeria, newImage]
      }
    });

    setNewImageUrl('');
    setNewImageDesc('');
  };

  const handleRemoveImageFromGallery = (index) => {
    const newGallery = formData.imagenes.galeria.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      imagenes: {
        ...formData.imagenes,
        galeria: newGallery
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (editingVehicle) {
        await vehicleService.update(editingVehicle._id, formData);
        setSuccess('Vehículo actualizado exitosamente');
      } else {
        await vehicleService.create(formData);
        setSuccess('Vehículo creado exitosamente');
      }
      setTimeout(() => {
        setShowModal(false);
        fetchVehicles();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al guardar vehículo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este vehículo?')) return;

    try {
      await vehicleService.delete(id);
      fetchVehicles();
      alert('Vehículo eliminado exitosamente');
    } catch (error) {
      alert(error.message || 'Error al eliminar vehículo');
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await vehicleService.changeStatus(id, newStatus);
      fetchVehicles();
    } catch (error) {
      alert(error.message || 'Error al cambiar estado');
    }
  };

  if (loading && vehicles.length === 0) {
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
        <h1 className="text-3xl font-bold">Gestionar Vehículos</h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus size={20} />
          Nuevo Vehículo
        </button>
      </div>

      {/* Lista de vehículos */}
      <div className="card">
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Vehículo</th>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Precio/Día</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle._id}>
                  <td>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: 'var(--radius)',
                      overflow: 'hidden',
                      backgroundColor: 'var(--gray-200)'
                    }}>
                      {vehicle.imagenes?.portada ? (
                        <img
                          src={vehicle.imagenes.portada}
                          alt={vehicle.modelo}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Car size={24} color="var(--gray-400)" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold">{vehicle.marca} {vehicle.modelo}</div>
                    <div className="text-sm text-gray-600">{vehicle.año}</div>
                  </td>
                  <td className="font-mono">{vehicle.placa}</td>
                  <td>
                    <span className="badge badge-info">{vehicle.tipo}</span>
                  </td>
                  <td className="font-semibold">{formatPrice(vehicle.precioDia)}</td>
                  <td>
                    <select
                      value={vehicle.estado}
                      onChange={(e) => handleChangeStatus(vehicle._id, e.target.value)}
                      className="input-field"
                      style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                    >
                      <option value="disponible">Disponible</option>
                      <option value="reservado">Reservado</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(vehicle)}
                        className="btn btn-sm"
                        style={{ padding: '0.5rem', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle._id)}
                        className="btn btn-sm btn-danger"
                        style={{ padding: '0.5rem' }}
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

        {vehicles.length === 0 && (
          <div className="text-center py-8">
            <Car size={64} color="var(--gray-400)" style={{ margin: '0 auto 1rem' }} />
            <p className="text-gray-600">No hay vehículos registrados</p>
          </div>
        )}
      </div>

      {/* Modal de crear/editar */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="text-2xl font-bold mb-4">
              {editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
            </h2>

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

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Marca</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Modelo</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Año</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.año}
                    onChange={(e) => setFormData({ ...formData, año: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Placa</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                    pattern="[A-Z]{3}[0-9]{2}[0-9A-Z]"
                    placeholder="ABC123"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select
                    className="input-field"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="pickup">Pickup</option>
                    <option value="coupe">Coupe</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Precio por Día</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.precioDia}
                    onChange={(e) => setFormData({ ...formData, precioDia: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Comuna</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.ubicacion.comuna}
                    onChange={(e) => setFormData({
                      ...formData,
                      ubicacion: { ...formData.ubicacion, comuna: e.target.value }
                    })}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Dirección</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.ubicacion.direccion}
                    onChange={(e) => setFormData({
                      ...formData,
                      ubicacion: { ...formData.ubicacion, direccion: e.target.value }
                    })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Transmisión</label>
                  <select
                    className="input-field"
                    value={formData.caracteristicas.transmision}
                    onChange={(e) => setFormData({
                      ...formData,
                      caracteristicas: { ...formData.caracteristicas, transmision: e.target.value }
                    })}
                  >
                    <option value="manual">Manual</option>
                    <option value="automatica">Automática</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Combustible</label>
                  <select
                    className="input-field"
                    value={formData.caracteristicas.combustible}
                    onChange={(e) => setFormData({
                      ...formData,
                      caracteristicas: { ...formData.caracteristicas, combustible: e.target.value }
                    })}
                  >
                    <option value="gasolina">Gasolina</option>
                    <option value="diesel">Diesel</option>
                    <option value="electrico">Eléctrico</option>
                    <option value="hibrido">Híbrido</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Pasajeros</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.caracteristicas.pasajeros}
                    onChange={(e) => setFormData({
                      ...formData,
                      caracteristicas: { ...formData.caracteristicas, pasajeros: parseInt(e.target.value) }
                    })}
                    min="2"
                    max="9"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Puertas</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.caracteristicas.puertas}
                    onChange={(e) => setFormData({
                      ...formData,
                      caracteristicas: { ...formData.caracteristicas, puertas: parseInt(e.target.value) }
                    })}
                    min="2"
                    max="5"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">URL Imagen de Portada *</label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.imagenes.portada}
                    onChange={(e) => setFormData({
                      ...formData,
                      imagenes: { ...formData.imagenes, portada: e.target.value }
                    })}
                    placeholder="https://example.com/imagen.jpg"
                    required
                  />
                </div>

                {/* Galería de Imágenes */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Galería de Imágenes (Opcional)</label>
                  
                  {/* Imágenes actuales */}
                  {formData.imagenes.galeria.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {formData.imagenes.galeria.map((img, index) => (
                        <div key={index} style={{
                          position: 'relative',
                          height: '120px',
                          backgroundColor: 'var(--gray-200)',
                          borderRadius: 'var(--radius)',
                          overflow: 'hidden'
                        }}>
                          <img
                            src={img.url}
                            alt={img.descripcion}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImageFromGallery(index)}
                            style={{
                              position: 'absolute',
                              top: '0.5rem',
                              right: '0.5rem',
                              backgroundColor: 'var(--danger)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                          {img.descripcion && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem'
                            }}>
                              {img.descripcion}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Agregar nueva imagen */}
                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'var(--gray-50)',
                    borderRadius: 'var(--radius)',
                    marginBottom: '1rem'
                  }}>
                    <input
                      type="url"
                      className="input-field mb-2"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="URL de la imagen"
                    />
                    <input
                      type="text"
                      className="input-field mb-2"
                      value={newImageDesc}
                      onChange={(e) => setNewImageDesc(e.target.value)}
                      placeholder="Descripción (opcional)"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageToGallery}
                      className="btn btn-secondary btn-sm"
                    >
                      + Agregar Imagen
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="input-field"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner spinner-sm"></div>
                      Guardando...
                    </>
                  ) : (
                    editingVehicle ? 'Actualizar' : 'Crear'
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
          .grid-cols-3 {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default ManageVehicles;