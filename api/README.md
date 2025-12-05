# Pinterest Clone API 📌

Backend para clon de Pinterest - Proyecto ITAM COM 11117.

**Stack:** FastAPI + SQLite + Unsplash API

---

## Integrantes

| Nombre | Rol |
|--------|-----|
| Emiliano Bobadilla | Backend |
| Luis Suarez | Frontend |

---

## Quick Start

### 1. Clonar y crear entorno virtual

```bash
git clone https://github.com/BobadillaE/Segundo_proyecto_integrador_IDW.git
cd api

# Crear venv
python -m venv venv

# Activar venv
# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

> ⚠️ **Importante:** Siempre activar el venv antes de trabajar en el proyecto.

### 2. Configuración de Unsplash

1. Ingresamos a https://unsplash.com/developers
2. Creamos una aplicación
3. Copiamos el **Access Key**
4. Creamos archivo `.env`:

```bash
UNSPLASH_ACCESS_KEY=5jvafo2QMPSGa1bB2GymZ7yLu1ojiJ8syyPz7QRGIRo
```

### 3. Ejecutar

```bash
uvicorn main:app --reload
```

La API estará en: http://localhost:8000

Documentación interactiva: http://localhost:8000/docs

---

## Endpoints

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Estado de la API, DB y Unsplash |

### Posts (CRUD)

| Método | Endpoint | Descripción | Header Requerido |
|--------|----------|-------------|------------------|
| GET | `/posts` | Lista paginada | - |
| GET | `/posts/{id}` | Post por ID | - |
| POST | `/posts` | Crear post | `X-User-Id` |
| PATCH | `/posts/{id}` | Modificar post | `X-User-Id` |
| PUT | `/posts/{id}` | Reemplazar post | `X-User-Id` |
| DELETE | `/posts/{id}` | Eliminar post | `X-User-Id` |

### Discover

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/discover` | Imágenes aleatorias de Unsplash |

---

## Guía para Frontend 

### Base URL

**Local:** `http://localhost:8000`

**Producción:** (pendiente deploy)

### Header de Autenticación

Todas las operaciones de escritura (POST, PATCH, PUT, DELETE) requieren el header:

```
X-User-Id: <nombre_usuario>
```

Este valor debe venir del `sessionStorage` del usuario. Ejemplo en React:

```javascript
const userId = sessionStorage.getItem('userId') || 'anonymous';

fetch('http://localhost:8000/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': userId
  },
  body: JSON.stringify({...})
});
```

---

### Ejemplos de Uso

#### 1. Obtener posts paginados

```javascript
// GET /posts?page=1&limit=10
const response = await fetch('http://localhost:8000/posts?page=1&limit=10');
const data = await response.json();

// Respuesta:
{
  "posts": [
    {
      "id": 1,
      "user_id": "emiliano",
      "image_url": "https://...",
      "description": "Mi foto",
      "tags": "nature,landscape",
      "created_at": "2025-12-05T10:30:00",
      "updated_at": "2025-12-05T10:30:00"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "total_pages": 3
}
```

#### 2. Obtener posts nuevos (sincronización con localStorage)

```javascript
// Guardar timestamp en localStorage
const lastSync = localStorage.getItem('lastSync');

let url = 'http://localhost:8000/posts?page=1&limit=20';
if (lastSync) {
  url += `&min_date=${lastSync}`;
}

const response = await fetch(url);
const data = await response.json();

// Actualizar timestamp
localStorage.setItem('lastSync', new Date().toISOString());
```

#### 3. Obtener un post por ID

```javascript
// GET /posts/1
const response = await fetch('http://localhost:8000/posts/1');
const post = await response.json();
```

#### 4. Crear un post

```javascript
// POST /posts
const response = await fetch('http://localhost:8000/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': sessionStorage.getItem('userId')
  },
  body: JSON.stringify({
    image_url: 'https://example.com/image.jpg',
    description: 'Mi nueva imagen',
    tags: 'travel,sunset'
  })
});

const newPost = await response.json();
// Status: 201 Created
```

#### 5. Modificar un post (PATCH - parcial)

```javascript
// PATCH /posts/1
// Solo envía los campos que quieres cambiar
const response = await fetch('http://localhost:8000/posts/1', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': sessionStorage.getItem('userId')
  },
  body: JSON.stringify({
    description: 'Nueva descripción'
  })
});

// Status: 200 OK o 403 Forbidden si no eres el dueño
```

#### 6. Reemplazar un post (PUT - completo)

```javascript
// PUT /posts/1
// Debes enviar todos los campos
const response = await fetch('http://localhost:8000/posts/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': sessionStorage.getItem('userId')
  },
  body: JSON.stringify({
    image_url: 'https://new-url.com/image.jpg',
    description: 'Descripción completa nueva',
    tags: 'new,tags'
  })
});
```

#### 7. Eliminar un post

```javascript
// DELETE /posts/1
const response = await fetch('http://localhost:8000/posts/1', {
  method: 'DELETE',
  headers: {
    'X-User-Id': sessionStorage.getItem('userId')
  }
});

// Status: 204 No Content (éxito)
// Status: 403 Forbidden (no eres el dueño)
// Status: 404 Not Found (no existe)
```

#### 8. Discover - Imágenes de Unsplash

```javascript
// GET /discover?count=12
const response = await fetch('http://localhost:8000/discover?count=12');
const images = await response.json();

// Respuesta (ya transformada, solo lo necesario):
[
  {
    "id": "abc123",
    "url": "https://images.unsplash.com/...",
    "thumb_url": "https://images.unsplash.com/...&w=200",
    "alt_description": "mountain landscape",
    "author": "John Doe",
    "author_url": "https://unsplash.com/@johndoe"
  }
]
```

---

### Manejo de Errores

| Status | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa |
| 201 | Created | Post creado |
| 204 | No Content | Post eliminado |
| 400 | Bad Request | Datos inválidos |
| 403 | Forbidden | No eres el dueño del post |
| 404 | Not Found | Post no existe |
| 503 | Service Unavailable | Unsplash no disponible |

Ejemplo de manejo:

```javascript
const response = await fetch('http://localhost:8000/posts/1', {
  method: 'DELETE',
  headers: { 'X-User-Id': userId }
});

if (response.status === 204) {
  console.log('Eliminado correctamente');
} else if (response.status === 403) {
  alert('No puedes eliminar posts de otros usuarios');
} else if (response.status === 404) {
  alert('El post ya no existe');
}
```

---

### Flujo de localStorage (Requisito del Proyecto)

El proyecto pide guardar posts en localStorage con timestamp. Aquí el flujo sugerido:

```javascript
// hooks/usePosts.js

async function fetchPosts() {
  const cached = localStorage.getItem('posts');
  const lastSync = localStorage.getItem('lastSync');
  
  // Primera carga: traer todos
  if (!cached || !lastSync) {
    const response = await fetch('http://localhost:8000/posts?limit=50');
    const data = await response.json();
    
    localStorage.setItem('posts', JSON.stringify(data.posts));
    localStorage.setItem('lastSync', new Date().toISOString());
    
    return data.posts;
  }
  
  // Cargas siguientes: solo posts nuevos
  const response = await fetch(
    `http://localhost:8000/posts?min_date=${lastSync}`
  );
  const data = await response.json();
  
  // Merge con cache
  const cachedPosts = JSON.parse(cached);
  const merged = [...data.posts, ...cachedPosts];
  
  localStorage.setItem('posts', JSON.stringify(merged));
  localStorage.setItem('lastSync', new Date().toISOString());
  
  return merged;
}
```

---

### Formulario de Usuario (sessionStorage)

El proyecto pide un formulario para guardar el usuario en sessionStorage:

```jsx
// components/UserForm.jsx

function UserForm() {
  const [username, setUsername] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    sessionStorage.setItem('userId', username);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Tu nombre de usuario"
      />
      <button type="submit">Guardar</button>
    </form>
  );
}
```

---

## Estructura del Proyecto

```
pinterest-api/
├── main.py           # FastAPI app + endpoints
├── database.py       # SQLite queries
├── requirements.txt  # Dependencias
├── .env              # Variables (no commitear)
├── .env.example      # Plantilla de variables
├── .gitignore        # Archivos ignorados por Git
├── database.db       # SQLite (se crea automático)
├── venv/             # Entorno virtual (no commitear)
└── README.md         # Esta documentación
```

---

## Deploy

### Render (Recomendado)

1. Crear cuenta en https://render.com
2. Conectar repositorio de GitHub
3. Crear "Web Service"
4. Configurar:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Agregar variable de entorno: `UNSPLASH_ACCESS_KEY`

**Nota:** En el free tier de Render, la base de datos SQLite se reinicia con cada deploy. Para la demo del proyecto está bien.

---

## OpenGraph

Para el frontend, agregar en el `<head>` del HTML:

```html
<meta property="og:title" content="Pinterest Clone" />
<meta property="og:description" content="Comparte y descubre imágenes increíbles" />
<meta property="og:image" content="https://tu-dominio.com/preview.jpg" />
<meta property="og:url" content="https://tu-dominio.com" />
<meta property="og:type" content="website" />
```

---

## Checklist del Proyecto

### Backend ✅
- [x] API REST con FastAPI
- [x] CRUD completo (GET/POST/PATCH/PUT/DELETE)
- [x] Paginación en listado
- [x] Filtro por fecha mínima
- [x] Validación de usuario por header
- [x] Integración Unsplash con transformación
- [x] Health endpoint (DB + API externa)
- [x] CORS habilitado
- [x] Documentación automática (/docs)

### Frontend (Lucho)
- [ ] Mosaico de imágenes
- [ ] Formulario de alta
- [ ] Formulario de edición
- [ ] Formulario de eliminación
- [ ] Sección Discover
- [ ] localStorage + timestamp
- [ ] sessionStorage para usuario
- [ ] Responsive con Bootstrap
- [ ] OpenGraph meta tags

### General
- [ ] Repositorio GitHub con PRs
- [ ] Deploy de frontend
- [ ] Deploy de backend
- [ ] README completo
- [ ] Live demo