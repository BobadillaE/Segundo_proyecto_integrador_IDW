# Pinterest Clone - Frontend 📌

Frontend React para clon de Pinterest - Proyecto ITAM COM 11117.

**Stack:** React + Vite + Bootstrap 5.3.8 + Python FastAPI

---

## Integrantes

| Nombre | Rol |
|--------|-----|
| Emiliano Bobadilla | Backend |
| Luis Suarez | Frontend |

---

## Quick Start

### 1. Instalación

```bash
cd pinterest-frontend
npm install
```

### 2. Configuración

Crea un archivo `.env` para personalizar la URL de la API (opcional):

```bash
VITE_API_BASE_URL=http://localhost:8000
```

> ⚠️ **Importante:** El backend debe estar ejecutándose en `http://localhost:8000` (o la URL configurada).

### 3. Ejecutar

```bash
npm run dev
```

La aplicación estará en: http://localhost:5173

---

## Estructura del Proyecto

```
pinterest-frontend/
├── src/
│   ├── components/          # Componentes React
│   ├── services/            # Servicios de API y almacenamiento
│   ├── css-styles/          # CSS específico de componentes
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── index.html               # Plantilla HTML
└── package.json             # Dependencias
```

---

## Componentes

### Componentes Principales

#### App.jsx - Componente Principal

El componente raíz que orquesta toda la aplicación.

**Responsabilidades:**
- Gestión de estado (posts, usuario, carga, errores)
- Autenticación de usuario mediante sessionStorage
- Operaciones CRUD de posts
- Carga de datos con caché en localStorage
- Sincronización incremental (solo posts nuevos)
- Manejo de errores con fallback a caché

#### UserForm.jsx - Autenticación

Formulario simple para identificación de usuario.

**Características:**
- Almacena `userId` en sessionStorage
- Primera pantalla si no existe userId
- Callback `onSave(userId)` al enviar

#### Sidebar.jsx - Navegación Lateral

Barra lateral fija izquierda con navegación.

**Características:**
- Logo Pinterest (ícono P)
- Enlaces: Inicio, Explorar, Guardados
- Posición fija izquierda

#### SearchBar.jsx - Búsqueda

Barra de búsqueda en la navegación superior.

**Características:**
- Campo de búsqueda con ícono
- Placeholder para funcionalidad futura

#### Discovery.jsx - Descubrimiento

Componente para descubrir imágenes de Unsplash.

**Características:**
- Botón "Cargar Imágenes" que obtiene imágenes aleatorias
- Transforma imágenes de Unsplash al formato de post
- Muestra imágenes en cuadrícula usando ImageGrid
- Estados de carga y error

**Props:**
- `onSaveImage(imageUrl)` - Callback al guardar imagen

#### ImageGrid.jsx - Cuadrícula de Imágenes

Contenedor que muestra una cuadrícula de tarjetas.

**Características:**
- Diseño responsivo con Bootstrap
- Mapea posts a componentes ImageCard
- Mensaje de estado vacío

**Props:**
- `posts` - Array de posts
- `currentUserId` - ID del usuario actual
- `onEdit(post)`, `onDelete(post)`, `onSave(imageUrl)` - Callbacks

#### ImageCard.jsx - Tarjeta Individual

Muestra una tarjeta de post/imagen con interacciones.

**Características:**
- Imagen con lazy loading
- Superposición al hover con botones de acción
- **Altura natural** - Ajusta según dimensiones de imagen (masonry)
- Botones: Guardar, Editar, Eliminar (condicionales por propiedad)
- Animaciones suaves

**Props:**
- `post` - Objeto post
- `currentUserId` - ID del usuario actual
- `onEdit(post)`, `onDelete(post)`, `onSave(imageUrl)` - Callbacks

#### SidebarPanel.jsx - Panel Lateral

Panel deslizante para gestión de posts.

**Características:**
- Se desliza desde la derecha
- Tres modos: crear, editar, eliminar
- Contiene formularios para cada operación

**Props:**
- `isOpen` - Visibilidad del panel
- `selectedPost` - Post seleccionado
- `onPostCreated()`, `onPostUpdated()`, `onPostDeleted()` - Callbacks
- `prefillImageUrl` - URL para prellenar formulario

#### CreatePostForm.jsx - Crear Post

Formulario para crear nuevos posts.

**Campos:**
- URL de imagen (requerido)
- Descripción (opcional)
- Tags (opcional, separados por comas)

**Props:**
- `onPostCreated()` - Callback después de crear
- `prefillImageUrl` - URL opcional para prellenar

#### EditPostForm.jsx - Editar Post

Formulario para editar posts existentes.

**Características:**
- Prellenado con datos existentes
- Toggle entre PATCH (parcial) y PUT (completo)
- Botón de cancelar

**Props:**
- `post` - Post a editar
- `onPostUpdated()` - Callback después de actualizar
- `onCancel()` - Callback de cancelación

#### DeletePostForm.jsx - Eliminar Post

Formulario de confirmación para eliminar.

**Características:**
- Vista previa del post
- Diálogo de confirmación
- Botón de eliminar con estado de carga

**Props:**
- `post` - Post a eliminar
- `onPostDeleted()` - Callback después de eliminar
- `onCancel()` - Callback de cancelación

---

## Composición de la Aplicación

### index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pinterest Clone - ITAM</title>
    
    <!-- Open Graph meta tags -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Pinterest Clone - Proyecto Integrador" />
    <meta property="og:description" content="Descubre y comparte imágenes increíbles." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Elementos:**
- `<div id="root">` - Donde React se monta
- Script carga `main.jsx` como módulo ES
- Meta tags Open Graph para redes sociales

### main.jsx

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Responsabilidades:**
- Importa CSS de Bootstrap
- Importa estilos globales
- Renderiza App en root
- Envuelve en StrictMode

### App.jsx - Jerarquía

```
App
├── UserForm (si no hay userId)
│
└── Layout Principal
    ├── Sidebar (izquierda, fijo)
    │
    ├── Contenido Principal
    │   ├── Barra Superior
    │   │   ├── Logo
    │   │   ├── SearchBar
    │   │   └── Acciones (Gestionar, Perfil, Notificaciones)
    │   │
    │   └── Área de Contenido
    │       ├── Discovery
    │       │   └── ImageGrid → ImageCard (múltiples)
    │       └── Posts Grid
    │           └── ImageCard (múltiples)
    │
    └── SidebarPanel (derecha, condicional)
        ├── CreatePostForm
        ├── EditPostForm
        └── DeletePostForm
```

**Flujo:**

1. **Verificación:** App verifica `userId` en sessionStorage
   - Si falta → Muestra `UserForm`
   - Si existe → Muestra layout principal

2. **Layout:**
   - **Sidebar** (izquierda): Navegación
   - **Contenido** (centro): Discovery + Posts
   - **SidebarPanel** (derecha): Gestión de posts

3. **Datos:**
   - Carga posts al montar
   - Usa caché localStorage
   - Sincronización incremental
   - Fallback a caché si API falla

---

## Servicios

### api.js - Servicio de API

Maneja todas las peticiones HTTP al backend FastAPI.

**URL Base:** `http://localhost:8000` (configurable vía `VITE_API_BASE_URL`)

**Funciones:**

| Función | Descripción |
|---------|-------------|
| `getPosts(page, limit, minDate)` | Obtener posts con paginación |
| `getPost(postId)` | Obtener un post individual |
| `createPost(postData)` | Crear nuevo post |
| `updatePost(postId, postData)` | Actualizar post (PATCH) |
| `replacePost(postId, postData)` | Reemplazar post (PUT) |
| `deletePost(postId)` | Eliminar post |
| `getDiscoverImages(count)` | Obtener imágenes de Unsplash |
| `healthCheck()` | Verificación de salud |

**Características:**
- Inyección automática de header `X-User-Id`
- Manejo de errores
- Manejo de 204 No Content para DELETE

### storage.js - Servicio de LocalStorage

Gestiona caché del lado del cliente.

**Funciones:**

| Función | Descripción |
|---------|-------------|
| `getCachedPosts()` | Recuperar posts en caché |
| `savePosts(posts)` | Guardar posts en caché |
| `getLastSync()` | Obtener timestamp de última sync |
| `setLastSync(timestamp)` | Establecer timestamp |
| `clearCache()` | Limpiar caché |
| `mergePosts(cached, new)` | Fusionar sin duplicados |

**Estrategia de Caché:**

```javascript
// Primera carga: obtener todos
if (!cached || !lastSync) {
  const response = await getPosts(1, 50);
  savePosts(response.posts);
  setLastSync(new Date().toISOString());
}

// Cargas siguientes: solo nuevos
const response = await getPosts(1, 50, lastSync);
const merged = mergePosts(cachedPosts, newPosts);
savePosts(merged);
setLastSync(new Date().toISOString());
```

---

## Ejemplos de Uso

### 1. Obtener posts

```javascript
import { getPosts } from './services/api';

// Obtener todos
const response = await getPosts(1, 50);
console.log(response.posts);

// Obtener solo nuevos (sincronización)
const lastSync = getLastSync();
const response = await getPosts(1, 50, lastSync);
```

### 2. Crear post

```javascript
import { createPost } from './services/api';

const newPost = await createPost({
  image_url: 'https://example.com/image.jpg',
  description: 'Mi nueva imagen',
  tags: 'travel,sunset'
});
```

### 3. Editar post

```javascript
import { updatePost } from './services/api';

// PATCH - solo campos cambiados
await updatePost(postId, {
  description: 'Nueva descripción'
});
```

### 4. Guardar imagen de Discovery

```javascript
// En Discovery.jsx
const handleSave = (imageUrl) => {
  onSaveImage(imageUrl); // Abre SidebarPanel con CreatePostForm prellenado
};
```

---

## Estilos

- **Bootstrap 5.3.8** - Framework CSS principal
- **CSS Personalizado** - Estilos en `css-styles/`
- **Responsive** - Mobile-first con breakpoints de Bootstrap

---

## Características

- ✅ Autenticación mediante sessionStorage
- ✅ CRUD completo de posts
- ✅ Sección Discovery con Unsplash
- ✅ Caché localStorage con sync incremental
- ✅ Soporte offline (fallback a caché)
- ✅ Diseño responsivo
- ✅ Cuadrícula masonry (altura natural)
- ✅ Interacciones hover en tarjetas
- ✅ Manejo de errores y estados de carga

---

## Integración con Backend

Este frontend consume el backend Python FastAPI. Ver `api/README.md` para documentación completa.

**Endpoints Utilizados:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/posts` | Listar posts |
| POST | `/posts` | Crear post |
| PATCH | `/posts/{id}` | Actualizar post (parcial) |
| PUT | `/posts/{id}` | Reemplazar post (completo) |
| DELETE | `/posts/{id}` | Eliminar post |
| GET | `/discover` | Obtener imágenes Unsplash |
| GET | `/health` | Verificación de salud |

---

## Checklist del Proyecto

### Frontend ✅
- [x] Mosaico de imágenes (masonry)
- [x] Formulario de alta
- [x] Formulario de edición
- [x] Formulario de eliminación
- [x] Sección Discover
- [x] localStorage + timestamp
- [x] sessionStorage para usuario
- [x] Responsive con Bootstrap
- [x] OpenGraph meta tags
- [x] Integración con FastAPI backend

### General
- [ ] Repositorio GitHub con PRs
- [ ] Deploy de frontend
- [ ] Deploy de backend
- [ ] README completo
- [ ] Live demo
