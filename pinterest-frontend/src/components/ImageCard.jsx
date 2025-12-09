import { useState } from 'react';
import '../css-styles/ImageCard.css';

function ImageCard({ post, currentUserId, onEdit, onDelete, onSave }) {
  const [isHovered, setIsHovered] = useState(false);
  const isOwner = currentUserId && post.user_id === currentUserId;

  const handleSave = () => {
    if (onSave && post.image_url) {
      onSave(post.image_url);
    }
  };

  return (
    <div
      className="card border-0 shadow-sm image-card w-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ borderRadius: '16px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div className="position-relative image-wrapper" style={{ borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
        <img
          src={post.image_url}
          alt={post.description || 'Imagen'}
          className="img-fluid w-100"
          style={{ display: 'block', transition: 'transform 0.3s ease', width: '100%', height: 'auto' }}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x400?text=Error+loading+image';
          }}
        />
        {isHovered && (
          <div 
            className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-start justify-content-end p-3"
            style={{ 
              background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.4), transparent)',
              transition: 'opacity 0.2s'
            }}
          >
            <div className="d-flex gap-2">
              {onSave && (
                <button
                  className="btn btn-danger btn-sm rounded-pill"
                  onClick={handleSave}
                  title="Guardar imagen"
                >
                  Guardar
                </button>
              )}
              {isOwner && onEdit && (
                <button
                  className="btn btn-light btn-sm rounded-pill"
                  onClick={() => onEdit(post)}
                  title="Editar post"
                >
                  Editar
                </button>
              )}
              {isOwner && onDelete && (
                <button
                  className="btn btn-light btn-sm rounded-pill"
                  onClick={() => onDelete(post)}
                  title="Eliminar post"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {(post.description || post.user_id) && (
        <div className="card-body p-3" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {post.description && (
            <p className="card-text mb-2 fw-semibold" style={{ fontSize: '0.9rem', lineHeight: '1.4', flexGrow: 1 }}>
              {post.description}
            </p>
          )}
          {post.user_id && (
            <small className="text-muted d-block mt-auto">Por: {post.user_id}</small>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageCard;

