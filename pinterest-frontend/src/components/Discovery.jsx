import { useState } from 'react';
import { getDiscoverImages } from '../services/api';
import ImageGrid from './ImageGrid';
import '../css-styles/Discovery.css';

function Discovery({ onSaveImage }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleLoadDiscovery = async () => {
    setLoading(true);
    setError(null);

    try {
      const discoveredImages = await getDiscoverImages(12);
      
      // Transform to post-like format for ImageGrid
      const transformedImages = discoveredImages.map(img => ({
        id: `discover_${img.id}`,
        user_id: 'unsplash',
        image_url: img.url,
        description: img.alt_description || '',
        tags: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      setImages(transformedImages);
      setHasLoaded(true);
    } catch (err) {
      setError(err.message || 'Error al cargar imágenes de descubrimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (imageUrl) => {
    if (onSaveImage) {
      onSaveImage(imageUrl);
    }
  };

  return (
    <div className="discovery-section mb-4">
      <div className="discovery-header container-fluid px-4 py-3">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="mb-0 fw-bold">Descubrir</h2>
          </div>
          <div className="col-auto ms-auto">
            <button 
              className="btn btn-danger rounded-pill px-4"
              onClick={handleLoadDiscovery}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Cargando...
                </>
              ) : (
                'Cargar Imágenes'
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="container-fluid px-4">
          <div className="alert alert-warning" role="alert">
            {error}
          </div>
        </div>
      )}

      {hasLoaded && images.length === 0 && !loading && (
        <div className="container-fluid px-4">
          <div className="alert alert-info" role="alert">
            No se encontraron imágenes
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div className="discovery-content">
          <ImageGrid 
            posts={images}
            currentUserId={null}
            onSave={handleSave}
          />
        </div>
      )}

      {!hasLoaded && !loading && (
        <div className="container-fluid px-4">
          <div className="text-center py-5">
            <p className="text-muted">
              Haz clic en "Cargar Imágenes" para descubrir contenido nuevo de Unsplash
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Discovery;

