"""
main.py - Pinterest Clone API
FastAPI backend con SQLite y integración Unsplash.

Ejecutar con: uvicorn main:app --reload
"""

import os
from datetime import datetime
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

import database

# Cargar variables de entorno
load_dotenv()

UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

# =============================================================================
# PYDANTIC SCHEMAS
# =============================================================================

class PostCreate(BaseModel):
    """Schema para crear un post."""
    image_url: str
    description: Optional[str] = None
    tags: Optional[str] = None


class PostUpdate(BaseModel):
    """Schema para actualizar parcialmente un post (PATCH)."""
    image_url: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None


class PostReplace(BaseModel):
    """Schema para reemplazar completamente un post (PUT)."""
    image_url: str
    description: Optional[str] = None
    tags: Optional[str] = None


class PostResponse(BaseModel):
    """Schema de respuesta de un post."""
    id: int
    user_id: str
    image_url: str
    description: Optional[str]
    tags: Optional[str]
    created_at: str
    updated_at: str


class PostListResponse(BaseModel):
    """Schema de respuesta para lista paginada de posts."""
    posts: list[PostResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class DiscoverImage(BaseModel):
    """Schema simplificado de imagen de Unsplash."""
    id: str
    url: str
    thumb_url: str
    alt_description: Optional[str]
    author: str
    author_url: str


class HealthResponse(BaseModel):
    """Schema de respuesta del health check."""
    status: str
    database: bool
    unsplash_api: bool
    timestamp: str


# =============================================================================
# FASTAPI APP
# =============================================================================

app = FastAPI(
    title="Pinterest Clone API",
    description="API para clon de Pinterest - Proyecto ITAM COM 11117",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS - Permitir conexiones desde cualquier origen (para desarrollo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Inicializar DB al arrancar
@app.on_event("startup")
def startup():
    database.init_db()


# =============================================================================
# HEALTH CHECK
# =============================================================================

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Verifica el estado de la API, la base de datos y la conexión a Unsplash.
    """
    # Check DB
    db_ok = database.check_db_connection()
    
    # Check Unsplash API
    unsplash_ok = False
    if UNSPLASH_ACCESS_KEY:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.unsplash.com/photos/random",
                    params={"client_id": UNSPLASH_ACCESS_KEY, "count": 1},
                    timeout=5.0
                )
                unsplash_ok = response.status_code == 200
        except Exception:
            unsplash_ok = False
    
    status = "healthy" if (db_ok and unsplash_ok) else "degraded"
    
    return {
        "status": status,
        "database": db_ok,
        "unsplash_api": unsplash_ok,
        "timestamp": datetime.utcnow().isoformat()
    }


# =============================================================================
# POSTS CRUD
# =============================================================================

@app.get("/posts", response_model=PostListResponse, tags=["Posts"])
def get_posts(
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(10, ge=1, le=50, description="Posts por página"),
    min_date: Optional[str] = Query(None, description="Fecha mínima ISO (para sync con localStorage)")
):
    """
    Obtiene lista de posts con paginación.
    
    - **page**: Número de página (default: 1)
    - **limit**: Cantidad de posts por página (default: 10, max: 50)
    - **min_date**: Solo posts creados después de esta fecha (formato ISO)
    """
    result = database.get_posts(page=page, limit=limit, min_date=min_date)
    return result


@app.get("/posts/{post_id}", response_model=PostResponse, tags=["Posts"])
def get_post(post_id: int):
    """
    Obtiene un post por su ID.
    """
    post = database.get_post_by_id(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post no encontrado")
    return post


@app.post("/posts", response_model=PostResponse, status_code=201, tags=["Posts"])
def create_post(
    post: PostCreate,
    x_user_id: str = Header(..., description="ID del usuario que crea el post")
):
    """
    Crea un nuevo post.
    
    Requiere header **X-User-Id** con el identificador del usuario.
    """
    new_post = database.create_post(
        user_id=x_user_id,
        image_url=post.image_url,
        description=post.description,
        tags=post.tags
    )
    return new_post


@app.patch("/posts/{post_id}", response_model=PostResponse, tags=["Posts"])
def update_post(
    post_id: int,
    post: PostUpdate,
    x_user_id: str = Header(..., description="ID del usuario que modifica el post")
):
    """
    Actualiza parcialmente un post (solo los campos enviados).
    
    Requiere header **X-User-Id**. Solo el creador puede modificar.
    """
    try:
        updated = database.update_post(
            post_id=post_id,
            user_id=x_user_id,
            image_url=post.image_url,
            description=post.description,
            tags=post.tags
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Post no encontrado")
        return updated
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@app.put("/posts/{post_id}", response_model=PostResponse, tags=["Posts"])
def replace_post(
    post_id: int,
    post: PostReplace,
    x_user_id: str = Header(..., description="ID del usuario que reemplaza el post")
):
    """
    Reemplaza completamente un post.
    
    Requiere header **X-User-Id**. Solo el creador puede reemplazar.
    """
    try:
        replaced = database.replace_post(
            post_id=post_id,
            user_id=x_user_id,
            image_url=post.image_url,
            description=post.description,
            tags=post.tags
        )
        if not replaced:
            raise HTTPException(status_code=404, detail="Post no encontrado")
        return replaced
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@app.delete("/posts/{post_id}", status_code=204, tags=["Posts"])
def delete_post(
    post_id: int,
    x_user_id: str = Header(..., description="ID del usuario que elimina el post")
):
    """
    Elimina un post.
    
    Requiere header **X-User-Id**. Solo el creador puede eliminar.
    """
    try:
        deleted = database.delete_post(post_id=post_id, user_id=x_user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Post no encontrado")
        return None
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


# =============================================================================
# DISCOVER - UNSPLASH INTEGRATION
# =============================================================================

@app.get("/discover", response_model=list[DiscoverImage], tags=["Discover"])
async def discover_images(
    count: int = Query(10, ge=1, le=30, description="Cantidad de imágenes a obtener")
):
    """
    Obtiene imágenes aleatorias de Unsplash para la sección de descubrimiento.
    
    Las imágenes son transformadas para devolver solo lo necesario para el render.
    """
    if not UNSPLASH_ACCESS_KEY:
        raise HTTPException(
            status_code=503,
            detail="Unsplash API no configurada. Falta UNSPLASH_ACCESS_KEY en .env"
        )
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.unsplash.com/photos/random",
                params={
                    "client_id": UNSPLASH_ACCESS_KEY,
                    "count": count
                },
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Error de Unsplash: {response.text}"
                )
            
            raw_images = response.json()
            
            # Transformar respuesta - solo lo necesario para el render
            transformed = []
            for img in raw_images:
                transformed.append({
                    "id": img["id"],
                    "url": img["urls"]["regular"],
                    "thumb_url": img["urls"]["thumb"],
                    "alt_description": img.get("alt_description"),
                    "author": img["user"]["name"],
                    "author_url": img["user"]["links"]["html"]
                })
            
            return transformed
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timeout conectando a Unsplash")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Error de conexión: {str(e)}")


# =============================================================================
# ROOT
# =============================================================================

@app.get("/", tags=["Root"])
def root():
    """
    Endpoint raíz con información básica de la API.
    """
    return {
        "name": "Pinterest Clone API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }
