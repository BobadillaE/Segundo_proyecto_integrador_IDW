import { useState, useEffect } from 'react';
import { createPost } from '../services/api';

function CreatePostForm({ onPostCreated, prefillImageUrl }) {
  const [imageUrl, setImageUrl] = useState(prefillImageUrl || '');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (prefillImageUrl) {
      setImageUrl(prefillImageUrl);
    }
  }, [prefillImageUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createPost({
        image_url: imageUrl.trim(),
        description: description.trim() || null,
        tags: tags.trim() || null,
      });

      // Reset form
      setImageUrl('');
      setDescription('');
      setTags('');

      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      setError(err.message || 'Error al crear el post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-form">
      <h5 className="mb-3">Crear Nuevo Post</h5>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="imageUrl" className="form-label">
            URL de la Imagen *
          </label>
          <input
            type="url"
            id="imageUrl"
            className="form-control"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Descripción
          </label>
          <textarea
            id="description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            placeholder="Describe tu imagen..."
          />
        </div>
        <div className="mb-3">
          <label htmlFor="tags" className="form-label">
            Tags (separados por comas)
          </label>
          <input
            type="text"
            id="tags"
            className="form-control"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="naturaleza, paisaje, montañas"
          />
        </div>
        <button
          type="submit"
          className="btn btn-danger w-100"
          disabled={loading || !imageUrl.trim()}
        >
          {loading ? 'Creando...' : 'Crear Post'}
        </button>
      </form>
    </div>
  );
}

export default CreatePostForm;

