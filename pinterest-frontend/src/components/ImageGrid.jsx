import ImageCard from './ImageCard';

function ImageGrid({ posts, currentUserId, onEdit, onDelete, onSave }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="container-fluid px-4 py-5">
        <div className="text-center">
          <p className="text-muted">No hay imágenes para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4">
      <div className="row g-4">
        {posts.map((post) => (
          <div key={post.id} className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 d-flex">
            <ImageCard
              post={post}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onSave={onSave}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageGrid;

