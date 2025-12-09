import { useState, useEffect } from 'react';
import CreatePostForm from './CreatePostForm';
import EditPostForm from './EditPostForm';
import DeletePostForm from './DeletePostForm';
import '../css-styles/SidebarPanel.css';

function SidebarPanel({
  isOpen,
  onClose,
  selectedPost,
  onPostCreated,
  onPostUpdated,
  onPostDeleted,
  prefillImageUrl,
}) {
  const [mode, setMode] = useState('create'); // 'create', 'edit', 'delete'

  // Update mode based on selectedPost
  useEffect(() => {
    if (selectedPost) {
      setMode('edit');
    } else if (prefillImageUrl) {
      setMode('create');
    } else {
      setMode('create');
    }
  }, [selectedPost, prefillImageUrl]);

  const handleClose = () => {
    setMode('create');
    if (onClose) {
      onClose();
    }
  };

  const handlePostUpdated = () => {
    setMode('create');
    if (onPostUpdated) {
      onPostUpdated();
    }
  };

  const handlePostDeleted = () => {
    setMode('create');
    if (onPostDeleted) {
      onPostDeleted();
    }
  };

  const handlePostCreated = () => {
    if (onPostCreated) {
      onPostCreated();
    }
  };

  const showDeleteMode = () => {
    setMode('delete');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`sidebar-panel ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-panel-header">
        <h4>Gestionar Posts</h4>
        <button className="btn-close" onClick={handleClose} aria-label="Cerrar">
          ×
        </button>
      </div>
      <div className="sidebar-panel-content">
        {selectedPost && mode === 'edit' && (
          <div className="mb-3">
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn ${mode === 'edit' ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={() => setMode('edit')}
              >
                Editar
              </button>
              <button
                type="button"
                className={`btn ${mode === 'delete' ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={showDeleteMode}
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
        {mode === 'create' && (
          <CreatePostForm
            onPostCreated={handlePostCreated}
            prefillImageUrl={prefillImageUrl}
          />
        )}
        {mode === 'edit' && selectedPost && (
          <EditPostForm
            post={selectedPost}
            onPostUpdated={handlePostUpdated}
            onCancel={() => setMode('create')}
          />
        )}
        {mode === 'delete' && selectedPost && (
          <DeletePostForm
            post={selectedPost}
            onPostDeleted={handlePostDeleted}
            onCancel={() => setMode('edit')}
          />
        )}
      </div>
    </div>
  );
}

export default SidebarPanel;

