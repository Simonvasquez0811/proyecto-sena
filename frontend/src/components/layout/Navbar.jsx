// src/components/layout/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav style={{
      backgroundColor: 'white',
      boxShadow: 'var(--shadow-md)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container">
        <div className="flex items-center justify-between" style={{ padding: '1rem 0' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="flex items-center gap-2">
              <Car size={32} color="var(--primary-600)" />
              <span style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                color: 'var(--gray-900)' 
              }}>
                OnWheels Rent
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="flex items-center gap-6" style={{ display: window.innerWidth > 768 ? 'flex' : 'none' }}>
            <Link to="/vehiculos" className="nav-link">
              Vehículos
            </Link>

            {user ? (
              <>
                {isAdmin() ? (
                  <Link to="/admin/dashboard" className="flex items-center gap-2 nav-link">
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                ) : (
                  <Link to="/mis-reservas" className="nav-link">
                    Mis Reservas
                  </Link>
                )}

                <Link to="/perfil" className="flex items-center gap-2 nav-link">
                  <User size={18} />
                  {user.nombre}
                </Link>

                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  <LogOut size={18} />
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ 
              display: window.innerWidth <= 768 ? 'block' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div 
            className="mobile-menu animate-fadeIn" 
            style={{ 
              paddingBottom: '1rem',
              borderTop: '1px solid var(--gray-200)',
              paddingTop: '1rem'
            }}
          >
            <Link 
              to="/vehiculos" 
              className="mobile-menu-item"
              onClick={() => setIsMenuOpen(false)}
            >
              Vehículos
            </Link>

            {user ? (
              <>
                {isAdmin() && (
                  <Link 
                    to="/admin/dashboard" 
                    className="mobile-menu-item"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                )}

                {!isAdmin() && (
                  <Link 
                    to="/mis-reservas" 
                    className="mobile-menu-item"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mis Reservas
                  </Link>
                )}

                <Link 
                  to="/perfil" 
                  className="mobile-menu-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} />
                  Perfil
                </Link>

                <button 
                  onClick={handleLogout} 
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  <LogOut size={18} />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link 
                  to="/login" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .nav-link {
          text-decoration: none;
          color: var(--gray-700);
          font-weight: 500;
          transition: color 0.3s ease;
        }
        
        .nav-link:hover {
          color: var(--primary-600);
        }

        .mobile-menu-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 0;
          text-decoration: none;
          color: var(--gray-700);
          font-weight: 500;
          border-bottom: 1px solid var(--gray-100);
        }

        .mobile-menu-item:hover {
          color: var(--primary-600);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;