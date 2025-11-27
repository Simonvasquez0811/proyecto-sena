// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, CreditCard, FileText, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    confirmarContraseña: '',
    telefono: '',
    cedula: '',
    licencia: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.contraseña !== formData.confirmarContraseña) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        nombre: formData.nombre,
        correo: formData.correo,
        contraseña: formData.contraseña,
        telefono: formData.telefono,
        cedula: formData.cedula,
        licencia: formData.licencia
      };

      await register(userData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      backgroundColor: 'var(--gray-50)'
    }}>
      <div className="card max-w-2xl w-full animate-fadeIn">
        <div className="text-center mb-6">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-100)',
            marginBottom: '1rem'
          }}>
            <UserPlus size={30} color="var(--primary-600)" />
          </div>
          <h1 className="text-3xl font-bold">Crear Cuenta</h1>
          <p className="text-gray-600 mt-2">
            Únete a OnWheels Rent y comienza a alquilar
          </p>
        </div>

        {error && (
          <div className="alert alert-danger mb-4">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="form-group">
              <label className="form-label">
                <User size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Nombre Completo
              </label>
              <input
                type="text"
                name="nombre"
                className="input-field"
                placeholder="Juan Pérez"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            {/* Correo */}
            <div className="form-group">
              <label className="form-label">
                <Mail size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Correo Electrónico
              </label>
              <input
                type="email"
                name="correo"
                className="input-field"
                placeholder="tu@correo.com"
                value={formData.correo}
                onChange={handleChange}
                required
              />
            </div>

            {/* Teléfono */}
            <div className="form-group">
              <label className="form-label">
                <Phone size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                className="input-field"
                placeholder="3001234567"
                value={formData.telefono}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                title="Debe ser un número de 10 dígitos"
              />
            </div>

            {/* Cédula */}
            <div className="form-group">
              <label className="form-label">
                <CreditCard size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Cédula
              </label>
              <input
                type="text"
                name="cedula"
                className="input-field"
                placeholder="1234567890"
                value={formData.cedula}
                onChange={handleChange}
                required
                pattern="[0-9]{6,10}"
                title="Debe ser un número de 6 a 10 dígitos"
              />
            </div>

            {/* Licencia */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">
                <FileText size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Licencia de Conducción
              </label>
              <input
                type="text"
                name="licencia"
                className="input-field"
                placeholder="C-12345678"
                value={formData.licencia}
                onChange={handleChange}
                required
                pattern="[A-Z]-[0-9]{8}"
                title="Formato: C-12345678"
              />
              <small className="text-gray-500" style={{ fontSize: '0.875rem' }}>
                Formato: C-12345678
              </small>
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label className="form-label">
                <Lock size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Contraseña
              </label>
              <input
                type="password"
                name="contraseña"
                className="input-field"
                placeholder="••••••••"
                value={formData.contraseña}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            {/* Confirmar Contraseña */}
            <div className="form-group">
              <label className="form-label">
                <Lock size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Confirmar Contraseña
              </label>
              <input
                type="password"
                name="confirmarContraseña"
                className="input-field"
                placeholder="••••••••"
                value={formData.confirmarContraseña}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm"></div>
                Creando cuenta...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Crear Cuenta
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" style={{
              color: 'var(--primary-600)',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>

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

export default Register;