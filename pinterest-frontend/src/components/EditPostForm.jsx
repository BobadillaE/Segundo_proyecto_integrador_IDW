import { useState, useEffect } from 'react';
import { updatePost, replacePost } from '../services/api';

function EditPostForm({ post, onPostUpdated, onCancel }) {
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usePatch, setUsePatch] = useState(true);

  useEffect(() => {
    if (post) {
      setImageUrl(post.image_url || '');
      setDescription(post.description || '');
      setTags(post.tags || '');
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!post) return;

    setLoading(true);
    setError(null);

    try {
      const postData = {
        image_url: imageUrl.trim(),
        description: description.trim() || null,
        tags: tags.trim() || null,
      };

      if (usePatch) {
        // PATCH: only send changed fields
        const changedFields = {};
        if (imageUrl.trim() !== (post.image_url || '')) {
          changedFields.image_url = imageUrl.trim();
        }
        if (description.trim() !== (post.description || '')) {
          changedFields.description = description.trim() || null;
        }
        if (tags.trim() !== (post.tags || '')) {
          changedFields.tags = tags.trim() || null;
        }

        if (Object.keys(changedFields).length > 0) {
          await updatePost(post.id, changedFields);
        }
      } else {
        // PUT: replace entire post
        await replacePost(post.id, postData);
      }

      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar el post');
    } finally {
      setLoading(false);
    }
  };

  if (!post) {
    return null;
  }

  return (
    <div className="post-form">
      <h5 className="mb-3">Editar Post</h5>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="mb-3">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="usePatch"
            checked={usePatch}
            onChange={(e) => setUsePatch(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="usePatch">
            Actualización parcial (PATCH)
          </label>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="editImageUrl" className="form-label">
            URL de la Imagen *
          </label>
          <input
            type="url"
            id="editImageUrl"
            className="form-control"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="editDescription" className="form-label">
            Descripción
          </label>
          <textarea
            id="editDescription"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="editTags" className="form-label">
            Tags (separados por comas)
          </label>
          <input
            type="text"
            id="editTags"
            className="form-control"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-danger flex-fill"
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
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
      </form>
    </div>
  );
}

export default EditPostForm;

