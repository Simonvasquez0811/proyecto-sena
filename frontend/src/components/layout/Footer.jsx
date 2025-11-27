// src/components/layout/Footer.jsx
import { Car, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: 'var(--gray-900)',
      color: 'white',
      marginTop: 'auto'
    }}>
      <div className="container py-8">
        <div className="grid grid-cols-1 grid-cols-md-3 gap-6">
          {/* Columna 1: Sobre nosotros */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Car size={28} color="var(--primary-400)" />
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                OnWheels Rent
              </span>
            </div>
            <p style={{ color: 'var(--gray-400)', lineHeight: 1.6 }}>
              Tu plataforma de confianza para alquilar vehículos en Medellín. 
              Calidad, seguridad y los mejores precios del mercado.
            </p>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
              Enlaces Rápidos
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/vehiculos" className="footer-link">
                Explorar Vehículos
              </Link>
              <Link to="/login" className="footer-link">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="footer-link">
                Registrarse
              </Link>
            </div>
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
              Contacto
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="flex items-center gap-2">
                <MapPin size={18} color="var(--primary-400)" />
                <span style={{ color: 'var(--gray-400)' }}>
                  Medellín, Colombia
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} color="var(--primary-400)" />
                <span style={{ color: 'var(--gray-400)' }}>
                  +57 300 123 4567
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={18} color="var(--primary-400)" />
                <span style={{ color: 'var(--gray-400)' }}>
                  info@onwheelsrent.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          borderTop: '1px solid var(--gray-800)',
          marginTop: '2rem',
          paddingTop: '2rem',
          textAlign: 'center',
          color: 'var(--gray-400)'
        }}>
          <p>
            © {currentYear} OnWheels Rent. Todos los derechos reservados.
          </p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Proyecto SENA-CTMA | Ficha 3145939
          </p>
        </div>
      </div>

      <style>{`
        .footer-link {
          color: var(--gray-400);
          text-decoration: none;
          transition: color 0.3s ease;
        }
        
        .footer-link:hover {
          color: var(--primary-400);
        }

        @media (min-width: 768px) {
          .grid-cols-md-3 {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;