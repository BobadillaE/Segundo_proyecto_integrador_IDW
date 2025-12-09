import { useState } from 'react';
import { deletePost } from '../services/api';

function DeletePostForm({ post, onPostDeleted, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!post) return;
    if (!window.confirm('¿Estás seguro de que quieres eliminar este post?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deletePost(post.id);
      if (onPostDeleted) {
        onPostDeleted();
      }
    } catch (err) {
      setError(err.message || 'Error al eliminar el post');
    } finally {
      setLoading(false);
    }
  };

  if (!post) {
    return null;
  }

  return (
    <div className="post-form">
      <h5 className="mb-3 text-danger">Eliminar Post</h5>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="mb-3">
        <p>¿Estás seguro de que quieres eliminar este post?</p>
        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.description || 'Post'}
            className="img-fluid rounded mb-2"
            style={{ maxHeight: '200px', objectFit: 'cover' }}
          />
        )}
        {post.description && (
          <p className="text-muted small">{post.description}</p>
        )}
      </div>
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-danger flex-fill"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? 'Eliminando...' : 'Eliminar'}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

export default DeletePostForm;

