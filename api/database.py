"""
database.py - Módulo de base de datos SQLite para Pinterest Clone API
Funciones CRUD con queries raw, sin ORM.
"""

import sqlite3
from datetime import datetime
from typing import Optional
from pathlib import Path

DATABASE_PATH = Path(__file__).parent / "database.db"


def get_connection() -> sqlite3.Connection:
    """Obtiene conexión a la base de datos con row_factory para dict-like access."""
    conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Inicializa la base de datos creando las tablas si no existen."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            image_url TEXT NOT NULL,
            description TEXT,
            tags TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at)")
    
    conn.commit()
    
    # Seed: insertar datos de prueba si la tabla está vacía
    cursor.execute("SELECT COUNT(*) FROM posts")
    if cursor.fetchone()[0] == 0:
        seed_posts = [
            ("demo_user", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4", "Montañas al amanecer", "nature,mountains,landscape"),
            ("demo_user", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d", "Retrato urbano", "portrait,urban,city"),
            ("demo_user", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e", "Templo en Kyoto", "japan,travel,architecture"),
            ("demo_user", "https://images.unsplash.com/photo-1519125323398-675f0ddb6308", "Café y código", "coffee,work,minimal"),
            ("demo_user", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438", "Fitness motivation", "fitness,gym,health"),
            ("emiliano", "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba", "Atardecer en la playa", "beach,sunset,ocean"),
            ("lucho", "https://images.unsplash.com/photo-1504384308090-c894fdcc538d", "Espacio de trabajo", "office,design,workspace"),
            ("lucho", "https://images.unsplash.com/photo-1501785888041-af3ef285b470", "Road trip", "travel,road,adventure"),
        ]
        
        now = datetime.utcnow().isoformat()
        cursor.executemany("""
            INSERT INTO posts (user_id, image_url, description, tags, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, [(u, img, desc, tags, now, now) for u, img, desc, tags in seed_posts])
        
        conn.commit()
    
    conn.close()


def check_db_connection() -> bool:
    """Verifica que la conexión a la DB funcione."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        conn.close()
        return True
    except Exception:
        return False


# =============================================================================
# CRUD OPERATIONS
# =============================================================================

def create_post(user_id: str, image_url: str, description: Optional[str] = None, tags: Optional[str] = None) -> dict:
    """Crea un nuevo post y retorna el post creado."""
    conn = get_connection()
    cursor = conn.cursor()
    
    now = datetime.utcnow().isoformat()
    
    cursor.execute("""
        INSERT INTO posts (user_id, image_url, description, tags, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, image_url, description, tags, now, now))
    
    post_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return get_post_by_id(post_id)


def get_post_by_id(post_id: int) -> Optional[dict]:
    """Obtiene un post por su ID."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM posts WHERE id = ?", (post_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None


def get_posts(
    page: int = 1,
    limit: int = 10,
    min_date: Optional[str] = None
) -> dict:
    """
    Obtiene posts con paginación.
    
    Args:
        page: Número de página (1-indexed)
        limit: Posts por página
        min_date: Fecha mínima en formato ISO (para sincronización con localStorage)
    
    Returns:
        Dict con posts, total, page, limit, y total_pages
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    offset = (page - 1) * limit
    
    # Query base
    if min_date:
        cursor.execute(
            "SELECT COUNT(*) FROM posts WHERE created_at > ?",
            (min_date,)
        )
        total = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT * FROM posts 
            WHERE created_at > ?
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        """, (min_date, limit, offset))
    else:
        cursor.execute("SELECT COUNT(*) FROM posts")
        total = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT * FROM posts 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        """, (limit, offset))
    
    rows = cursor.fetchall()
    conn.close()
    
    posts = [dict(row) for row in rows]
    total_pages = (total + limit - 1) // limit  # Ceil division
    
    return {
        "posts": posts,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }


def update_post(post_id: int, user_id: str, **fields) -> Optional[dict]:
    """
    Actualiza campos específicos de un post (PATCH).
    Solo actualiza si el user_id coincide con el creador.
    
    Returns:
        Post actualizado o None si no existe/no autorizado
    """
    # Verificar que el post existe y pertenece al usuario
    existing = get_post_by_id(post_id)
    if not existing:
        return None
    if existing["user_id"] != user_id:
        raise PermissionError("No tienes permiso para modificar este post")
    
    # Construir query dinámico solo con campos proporcionados
    allowed_fields = {"image_url", "description", "tags"}
    update_fields = {k: v for k, v in fields.items() if k in allowed_fields and v is not None}
    
    if not update_fields:
        return existing
    
    update_fields["updated_at"] = datetime.utcnow().isoformat()
    
    set_clause = ", ".join(f"{k} = ?" for k in update_fields.keys())
    values = list(update_fields.values()) + [post_id]
    
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute(f"UPDATE posts SET {set_clause} WHERE id = ?", values)
    conn.commit()
    conn.close()
    
    return get_post_by_id(post_id)


def replace_post(post_id: int, user_id: str, image_url: str, description: Optional[str] = None, tags: Optional[str] = None) -> Optional[dict]:
    """
    Reemplaza completamente un post (PUT).
    Solo reemplaza si el user_id coincide con el creador.
    """
    existing = get_post_by_id(post_id)
    if not existing:
        return None
    if existing["user_id"] != user_id:
        raise PermissionError("No tienes permiso para modificar este post")
    
    now = datetime.utcnow().isoformat()
    
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE posts 
        SET image_url = ?, description = ?, tags = ?, updated_at = ?
        WHERE id = ?
    """, (image_url, description, tags, now, post_id))
    
    conn.commit()
    conn.close()
    
    return get_post_by_id(post_id)


def delete_post(post_id: int, user_id: str) -> bool:
    """
    Elimina un post.
    Solo elimina si el user_id coincide con el creador.
    
    Returns:
        True si se eliminó, False si no existía
    Raises:
        PermissionError si el usuario no es el dueño
    """
    existing = get_post_by_id(post_id)
    if not existing:
        return False
    if existing["user_id"] != user_id:
        raise PermissionError("No tienes permiso para eliminar este post")
    
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM posts WHERE id = ?", (post_id,))
    conn.commit()
    conn.close()
    
    return True
