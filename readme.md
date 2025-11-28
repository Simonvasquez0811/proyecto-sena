# 🚗 OnWheels Rent - Plataforma de Alquiler de Vehículos
Plataforma web full-stack para la gestión y alquiler de vehículos en Medellín, Colombia. Sistema centralizado donde un administrador controla completamente el inventario de vehículos y los usuarios pueden buscar, reservar y gestionar sus alquileres.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Equipo](#-equipo)

---

## ✨ Características

### 👥 Para Usuarios
- ✅ Registro e inicio de sesión seguro
- ✅ Búsqueda avanzada de vehículos con múltiples filtros
- ✅ Visualización detallada de vehículos con galería de imágenes
- ✅ Sistema de reservas con validación de disponibilidad
- ✅ Historial completo de reservas
- ✅ Gestión de perfil personal
- ✅ Notificaciones de estado de reservas

### 🔐 Para Administradores
- ✅ Panel de control con estadísticas en tiempo real
- ✅ Gestión completa de vehículos (CRUD)
  - Crear vehículos con múltiples imágenes
  - Editar información y características
  - Cambiar estados (disponible, reservado, mantenimiento, inactivo)
  - Eliminar vehículos
- ✅ Gestión de usuarios
  - Ver lista completa de usuarios
  - Cambiar roles (usuario ↔ administrador)
  - Activar/desactivar cuentas
  - Resetear intentos fallidos
- ✅ Gestión de reservas
  - Ver todas las reservas del sistema
  - Cambiar estados con observaciones
  - Historial de cambios
  - Filtros avanzados
- ✅ Reportes y estadísticas
  - Vehículos más populares
  - Ingresos totales y mensuales
  - Tasa de ocupación
  - Actividad reciente

### 🛡️ Seguridad
- ✅ Autenticación con JWT (tokens de 30 días)
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Bloqueo automático tras 5 intentos fallidos (30 minutos)
- ✅ Control de acceso basado en roles
- ✅ Validación de datos en frontend y backend
- ✅ Protección de rutas privadas

---

## 🛠️ Tecnologías

### Backend
- **Node.js** v14+ - Entorno de ejecución JavaScript
- **Express.js** - Framework web minimalista
- **MongoDB Atlas** - Base de datos NoSQL en la nube
- **Mongoose** - ODM para MongoDB
- **JWT** (jsonwebtoken) - Autenticación basada en tokens
- **bcryptjs** - Encriptación de contraseñas
- **Cors** - Manejo de CORS
- **dotenv** - Variables de entorno

### Frontend
- **React** 18+ - Biblioteca de interfaces de usuario
- **Vite** - Build tool y dev server ultrarrápido
- **React Router DOM** - Enrutamiento del lado del cliente
- **Axios** - Cliente HTTP para consumir la API
- **Lucide React** - Iconos modernos
- **CSS3** - Estilos personalizados (sin frameworks)

### Herramientas de Desarrollo
- **Git & GitHub** - Control de versiones
- **VS Code** - Editor de código
- **Postman/Thunder Client** - Testing de API
- **Nodemon** - Auto-reinicio del servidor

---

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura en capas (Layered Architecture)** con separación clara de responsabilidades:

```
┌─────────────────────────────────────┐
│     Frontend (React + Vite)        │
│   - Componentes UI                  │
│   - Context API (Estado global)    │
│   - Servicios (API calls)          │
└─────────────────────────────────────┘
              ↓ HTTP/REST
┌─────────────────────────────────────┐
│     Backend API (Express.js)       │
│   - Rutas (Routes)                  │
│   - Controladores (Controllers)    │
│   - Middlewares (Auth, Validation) │
└─────────────────────────────────────┘
              ↓ Mongoose ODM
┌─────────────────────────────────────┐
│     Base de Datos (MongoDB)        │
│   - Colección: Users                │
│   - Colección: Vehicles             │
│   - Colección: Reservations         │
└─────────────────────────────────────┘
```

### Modelos de Datos

#### Usuario (User)
```javascript
{
  nombre: String,
  correo: String (único),
  contraseña: String (encriptada),
  telefono: String,
  cedula: String (único),
  licencia: String,
  rol: String (usuario/administrador),
  activo: Boolean,
  verificado: Boolean,
  intentosFallidos: Number,
  bloqueadoHasta: Date
}
```

#### Vehículo (Vehicle)
```javascript
{
  marca: String,
  modelo: String,
  año: Number,
  placa: String (único),
  tipo: String,
  color: String,
  precioDia: Number,
  ubicacion: {
    ciudad: String,
    comuna: String,
    direccion: String,
    coordenadas: { lat, lng }
  },
  caracteristicas: {
    transmision: String,
    combustible: String,
    pasajeros: Number,
    puertas: Number,
    // ... más características
  },
  imagenes: {
    portada: String (URL),
    galeria: [{ url, descripcion, orden }]
  },
  estado: String,
  kilometraje: Number,
  descripcion: String
}
```

#### Reserva (Reservation)
```javascript
{
  usuario: ObjectId (ref: User),
  vehiculo: ObjectId (ref: Vehicle),
  fechaInicio: Date,
  fechaFin: Date,
  diasReserva: Number,
  costoTotal: Number,
  estado: String,
  lugarEntrega: String,
  lugarDevolucion: String,
  notas: String,
  historialEstados: [{ estado, fecha, observacion }]
}
```

---

## 📦 Instalación

### Prerrequisitos
- Node.js v14 o superior
- MongoDB Atlas (cuenta gratuita)
- Git
- Editor de código (VS Code recomendado)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Simonvasquez0811/proyecto-sena
cd onwheels-rent
```

### 2. Configurar Backend
```bash
# Navegar a la carpeta del backend
cd onwheels-rent-backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Configurar Frontend
```bash
# En una nueva terminal, navegar a la carpeta del frontend
cd onwheels-rent-frontend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
# Verificar la URL del backend
```

---

## ⚙️ Configuración

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/onwheels-rent
JWT_SECRET=tu_clave_secreta_super_segura_aqui
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=OnWheels Rent
VITE_ENV=development
```

### MongoDB Atlas Setup
1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un cluster gratuito (M0)
3. Crear usuario de base de datos
4. Permitir acceso desde cualquier IP (0.0.0.0/0) o tu IP específica
5. Obtener la cadena de conexión y agregarla al `.env`

---

## 🚀 Uso

### Iniciar Backend
```bash
cd onwheels-rent-backend

# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start

# Insertar datos de prueba
npm run test-data
```

El servidor estará disponible en `http://localhost:5000`

### Iniciar Frontend
```bash
cd onwheels-rent-frontend

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

La aplicación estará disponible en `http://localhost:5173`

### Credenciales de Prueba

Después de ejecutar `npm run test-data`:

**Administrador:**
- Correo: `admin@onwheels.com`
- Contraseña: `admin123`

**Usuario Normal:**
- Correo: `carlos@gmail.com`
- Contraseña: `carlos123`

---

## 📡 API Endpoints

### Autenticación (`/api/auth`)
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| POST | `/registro` | Registrar nuevo usuario | Público |
| POST | `/login` | Iniciar sesión | Público |
| GET | `/perfil` | Obtener perfil | Privado |
| PUT | `/perfil` | Actualizar perfil | Privado |

### Vehículos (`/api/vehiculos`)
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/` | Listar vehículos (filtros) | Público |
| GET | `/:id` | Ver detalle | Público |
| POST | `/` | Crear vehículo | Admin |
| PUT | `/:id` | Actualizar vehículo | Admin |
| DELETE | `/:id` | Eliminar vehículo | Admin |
| PATCH | `/:id/estado` | Cambiar estado | Admin |
| PATCH | `/:id/portada` | Cambiar portada | Admin |
| POST | `/:id/imagenes` | Agregar imagen | Admin |
| DELETE | `/:id/imagenes/:imagenId` | Eliminar imagen | Admin |

### Reservas (`/api/reservas`)
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| POST | `/` | Crear reserva | Privado |
| GET | `/` | Listar reservas | Privado |
| GET | `/mis-reservas` | Mis reservas | Privado |
| GET | `/estadisticas` | Estadísticas | Admin |
| GET | `/:id` | Ver detalle | Privado |
| PUT | `/:id` | Editar reserva | Privado |
| PATCH | `/:id/estado` | Cambiar estado | Admin |
| DELETE | `/:id` | Cancelar reserva | Privado |

### Usuarios (`/api/usuarios`) - Admin
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Listar usuarios |
| GET | `/estadisticas` | Estadísticas |
| GET | `/:id` | Ver detalle |
| PATCH | `/:id/rol` | Cambiar rol |
| PATCH | `/:id/estado` | Activar/desactivar |
| PATCH | `/:id/verificar` | Verificar usuario |
| PATCH | `/:id/resetear-intentos` | Resetear bloqueo |
| DELETE | `/:id` | Eliminar usuario |

### Dashboard (`/api/dashboard`) - Admin
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/estadisticas` | Estadísticas generales |
| GET | `/reservas-periodo` | Reservas por periodo |
| GET | `/reporte-vehiculos` | Reporte de vehículos |
| GET | `/actividad-reciente` | Actividad reciente |

---

## 📁 Estructura del Proyecto

```
onwheels-rent/
│
├── onwheels-rent-backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── vehicleController.js
│   │   │   ├── reservationController.js
│   │   │   ├── userController.js
│   │   │   └── dashboardController.js
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Vehicle.js
│   │   │   └── Reservation.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── vehicleRoutes.js
│   │   │   ├── reservationRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── utils/
│   │   │   └── validators.js
│   │   └── server.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── testData.js
│   └── crearAdmin.js
│
└── onwheels-rent-frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       ├── Navbar.jsx
    │   │       └── Footer.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── ManageVehicles.jsx
    │   │   │   ├── ManageUsers.jsx
    │   │   │   └── ManageReservations.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Vehicles.jsx
    │   │   ├── VehicleDetail.jsx
    │   │   ├── MyReservations.jsx
    │   │   └── Profile.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   ├── vehicleService.js
    │   │   └── reservationService.js
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── .gitignore
    ├── package.json
    └── vite.config.js
```

---

## 📸 Capturas de Pantalla

### Página de Inicio
![Home](imagenes/Home.png)

### Panel de Administración
![Dashboard](imagenes/Dashboard.png)

### Gestión de Vehículos
![Manage Vehicles](imagenes/Manage.png)

---

## 👥 Equipo

**Proyecto Formativo SENA-CTMA**
- **Ficha:** 3145939
- **Instructor:** Mateo Arroyave
- **Año:** 2025

### Desarrolladores

| Nombre | Rol | GitHub |
|--------|-----|--------|
| **Simón Vásquez Escobar** | Líder & Desarrollador Full-Stack |
| **Miguel Ángel Aguirre Moreno** | Analista & Tester | 
| **Melissa Jasbleidy Sandoval** | Diseñadora UX/UI |

---



## 🔮 Futuras Mejoras

- [ ] Pagos en linea simulados
- [ ] Notificaciones por correo (Nodemailer)
- [ ] Integración con Google Maps API

---

<div align="center">

**Desarrollado con ❤️ por el equipo OnWheels Rent**

[![SENA](https://img.shields.io/badge/SENA-CTMA-orange?style=for-the-badge)](https://www.sena.edu.co/)
[![License](https://img.shields.io/badge/License-Educational-blue?style=for-the-badge)](LICENSE)

</div>
