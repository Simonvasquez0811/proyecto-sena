// src/pages/Profile.jsx
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, CreditCard, FileText, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>

      <div className="grid grid-cols-1 grid-cols-2 gap-6">
        {/* Información Personal */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Información Personal</h2>

          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <User size={18} />
                <span className="text-sm font-medium">Nombre</span>
              </div>
              <p className="text-lg">{user?.nombre}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Mail size={18} />
                <span className="text-sm font-medium">Correo</span>
              </div>
              <p className="text-lg">{user?.correo}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Phone size={18} />
                <span className="text-sm font-medium">Teléfono</span>
              </div>
              <p className="text-lg">{user?.telefono || 'No registrado'}</p>
            </div>
          </div>
        </div>

        {/* Documentos */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Documentos</h2>

          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <CreditCard size={18} />
                <span className="text-sm font-medium">Cédula</span>
              </div>
              <p className="text-lg">{user?.cedula || 'No registrada'}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <FileText size={18} />
                <span className="text-sm font-medium">Licencia de Conducción</span>
              </div>
              <p className="text-lg">{user?.licencia || 'No registrada'}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Shield size={18} />
                <span className="text-sm font-medium">Rol</span>
              </div>
              <div className={`badge ${
                user?.rol === 'administrador' ? 'badge-danger' : 'badge-info'
              }`}>
                {user?.rol === 'administrador' ? 'Administrador' : 'Usuario'}
              </div>
            </div>
          </div>
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

export default Profile;