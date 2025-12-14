# Pinterest Clone - Segundo Proyecto Integrador

> **Materia:** Introducción al Desarrollo Web (Otoño 2025) - ITAM
> **Proyecto:** Imitación de Pinterest con integración de Unsplash API y persistencia en SQLite.

---

## 👥 Autores
* **Emiliano Bobadilla Franco**
* 
![unnamed](https://github.com/user-attachments/assets/c6598b7d-1c90-4fe4-a375-aece942c5603)


* **Luis Eduardo Suarez Arroyo**
* 
![imagen grad](https://github.com/user-attachments/assets/ba228ae1-3532-4e65-8822-5ba64a8f59aa)


*(Nota: Recuerden agregar sus fotografías aquí para cumplir con el requisito del entregable).*

---

## 📝 Resumen del Producto
Esta aplicación es una plataforma de descubrimiento visual estilo "Pinterest". Permite a los usuarios explorar un feed de imágenes obtenidas dinámicamente desde la API de Unsplash, así como gestionar su propia colección de pines.

**Características principales:**
* **Descubrimiento:** Integración con Unsplash API para traer y transformar imágenes externas.
* **Persistencia:** Base de datos propia (SQLite) para guardar, editar y eliminar posts.
* **Seguridad:** Validación de propiedad mediante Headers (no se pueden borrar posts ajenos).
* **Experiencia Offline:** Uso de LocalStorage para visualizar contenido sin conexión inmediata.
* **Diseño:** Interfaz responsiva tipo "Mosaico" (Masonry Layout).

---

## 🔗 Live Demo (Despliegue)
* **Frontend (Sitio Web):** [https://segundoproyectointegrador-d3c9x6qr2-luisesuarezas-projects.vercel.app/]
* **Backend (API & Docs):** [https://api-pinterest-vegh.onrender.com/docs]
* **Health Check:** `https://api-pinterest-vegh.onrender.com/health`

---

## ⚙️ Instrucciones para levantar el Backend

El backend está construido con **Python (FastAPI)** y utiliza **SQLite** como base de datos.

### Prerrequisitos
* Python 3.10 o superior.
* Clave de API de Unsplash (Configurada en variable de entorno).

### Pasos de instalación local

1.  **Navegar a la carpeta del servidor:**
    ```bash
    cd api
    ```

2.  **Crear y activar entorno virtual:**
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # Mac/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Instalar dependencias:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configurar Variables de Entorno:**
    Crear un archivo `.env` dentro de la carpeta `api/` con el siguiente contenido:
    ```env
    UNSPLASH_ACCESS_KEY=tu_clave_de_unsplash_aqui
    ```

5.  **Levantar el servidor:**
    ```bash
    uvicorn main:app --reload
    ```
    El servidor iniciará en: `http://localhost:8000`

---

## ⚙️ Instrucciones para levantar el Frontend

El frontend está construido con **React + Vite** y utiliza **Bootstrap 5.3.8** para el diseño.

### Prerrequisitos
* Node.js 16 o superior (y npm incluido).
* Backend ejecutándose en `http://localhost:8000` (o la URL configurada).

### Pasos de instalación local

1.  **Navegar a la carpeta del frontend:**
    ```bash
    cd pinterest-frontend
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno (Opcional):**
    Crear un archivo `.env` dentro de la carpeta `pinterest-frontend/` para personalizar la URL de la API:
    ```env
    VITE_API_BASE_URL=http://localhost:8000
    ```
    > **Nota:** Si no se configura, el frontend usará `http://localhost:8000` por defecto.

4.  **Levantar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación iniciará en: `http://localhost:5173`

5.  **Construir para producción (Opcional):**
    ```bash
    npm run build
    ```
    Los archivos optimizados se generarán en la carpeta `dist/`.

### Características del Frontend

* **Stack Tecnológico:**
  * React 19.2.0
  * Vite 7.2.4 (Build tool)
  * Bootstrap 5.3.8 (Framework CSS)
  
* **Funcionalidades:**
  * Autenticación mediante sessionStorage (identificación de usuario)
  * CRUD completo de posts (crear, leer, actualizar, eliminar)
  * Sección Discovery con integración de Unsplash
  * Caché localStorage con sincronización incremental
  * Soporte offline (fallback a caché cuando la API no está disponible)
  * Diseño responsivo tipo "Masonry Layout"
  * Interacciones hover en tarjetas de imágenes
  * Manejo de errores y estados de carga

* **Estructura Principal:**
  * `src/components/` - Componentes React reutilizables
  * `src/services/` - Servicios de API y almacenamiento local
  * `src/css-styles/` - Estilos CSS personalizados
  * `src/App.jsx` - Componente principal de la aplicación

---

## 📡 Documentación de la API

La API cuenta con documentación interactiva automática (Swagger UI) disponible en `/docs`.

### Endpoints Principales

#### 1. Verificación de Estado
* **GET** `/health`
* Retorna el estado de la base de datos y la conexión con Unsplash.

#### 2. Gestión de Posts (CRUD)
* **GET** `/posts`: Obtiene la lista de posts guardados (soporta paginación `?page=1&limit=10` y filtro por fecha `?min_date=...`).
* **POST** `/posts`: Crea un nuevo post.
    * *Body:* `{"image_url": "...", "description": "...", "tags": "..."}`
    * *Header Requerido:* `X-User-Id`
* **PATCH** `/posts/{id}`: Edición parcial de un post.
* **PUT** `/posts/{id}`: Reemplazo total de un post.
* **DELETE** `/posts/{id}`: Elimina un post permanentemente.
    * *Seguridad:* Solo el creador del post puede eliminarlo.

#### 3. Descubrimiento (API Externa)
* **GET** `/discover`
* Consume la API de Unsplash, limpia los datos innecesarios y devuelve una lista optimizada de imágenes para el frontend.

---

## 🛡️ Manejo de Errores y Seguridad

La API implementa códigos de estado HTTP estándar:

* **200 OK:** Petición exitosa.
* **201 Created:** Recurso creado exitosamente.
* **403 Forbidden:** Intento de modificar/eliminar un recurso que no pertenece al usuario (Validación de `X-User-Id`).
* **404 Not Found:** El post o recurso solicitado no existe.
* **500 Internal Server Error:** Error en la conexión con base de datos o API externa.
