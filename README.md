# Espina Rawson Backend

Backend profesional para el sitio web de Espina Rawson & Asoc.

## 🚀 Características

- **API REST** completa con Express y TypeScript
- **Base de datos PostgreSQL** con Prisma ORM
- **Autenticación JWT** segura
- **Backoffice profesional** con React
- **Gestión completa de contenido**
- **Sistema de subastas** con imágenes
- **Logs de actividad**
- **API pública** para el frontend

## 📋 Requisitos

- Node.js 18+
- PostgreSQL
- NPM o Yarn

## 🛠️ Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/matigoldberg14/espina-rawson-backend.git
cd espina-rawson-backend
```

2. Instalar dependencias:

```bash
npm install
cd backoffice && npm install
```

3. Configurar variables de entorno:

```bash
cp .env.example .env
```

4. Configurar la base de datos:

```bash
# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:push

# Ejecutar seed inicial
npm run db:seed
```

## 🚀 Desarrollo

### Backend API:

```bash
npm run dev
```

### Backoffice:

```bash
cd backoffice && npm run dev
```

## 📦 Construcción

```bash
# Backend
npm run build

# Backoffice
cd backoffice && npm run build
```

## 🌐 Despliegue en Railway

1. Crear un nuevo proyecto en Railway
2. Agregar servicio PostgreSQL
3. Conectar el repositorio de GitHub
4. Configurar las variables de entorno:

   - `DATABASE_URL` (proporcionada por Railway)
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `FRONTEND_URL`

5. Configurar el build command:

```bash
npm install && npm run prisma:generate && npm run build && cd backoffice && npm install && npm run build
```

6. Configurar el start command:

```bash
npm run start
```

## 📚 API Endpoints

### Autenticación

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Perfil actual

### Contenido

- `GET /api/content` - Listar contenidos
- `PUT /api/content/:id` - Actualizar contenido

### Subastas

- `GET /api/auctions` - Listar subastas
- `POST /api/auctions` - Crear subasta
- `PUT /api/auctions/:id` - Actualizar subasta
- `DELETE /api/auctions/:id` - Eliminar subasta

### Público (sin autenticación)

- `GET /api/public/content` - Contenido del sitio
- `GET /api/public/auctions` - Subastas activas
- `GET /api/public/auctions/featured` - Subastas destacadas

## 📱 Backoffice

El backoffice está disponible en `/backoffice` y permite:

- Gestión de contenido del sitio
- Administración de subastas
- Configuración de áreas de práctica
- Panel de estadísticas
- Configuración general

### Credenciales por defecto:

- Email: `admin@espinarawson.com`
- Password: `AdminEspina2024!`

⚠️ **Importante**: Cambiar las credenciales en producción.
