// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    correo: '',
    contraseña: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
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
    setLoading(true);

    try {
      await login(formData.correo, formData.contraseña);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
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
      <div className="card max-w-md w-full animate-fadeIn">
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
            <LogIn size={30} color="var(--primary-600)" />
          </div>
          <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
          <p className="text-gray-600 mt-2">
            Accede a tu cuenta de OnWheels Rent
          </p>
        </div>

        {error && (
          <div className="alert alert-danger mb-4">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm"></div>
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" style={{
              color: 'var(--primary-600)',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Credenciales de prueba */}
        <div className="mt-6 p-4" style={{
          backgroundColor: 'var(--gray-100)',
          borderRadius: 'var(--radius)',
          fontSize: '0.875rem'
        }}>
          <p className="font-semibold mb-2">Credenciales de prueba:</p>
          <p><strong>Admin:</strong> admin@onwheels.com / admin123</p>
          <p><strong>Usuario:</strong> carlos@gmail.com / carlos123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;