import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import Sidebar from './components/Sidebar';
import ImageGrid from './components/ImageGrid';
import ImageCard from './components/ImageCard';
import UserForm from './components/UserForm';
import SidebarPanel from './components/SidebarPanel';
import Discovery from './components/Discovery';
import { getPosts } from './services/api';
import { getCachedPosts, savePosts, getLastSync, setLastSync, mergePosts } from './services/storage';
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showSidebarPanel, setShowSidebarPanel] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [prefillImageUrl, setPrefillImageUrl] = useState(null);

  // Check for userId on mount
  useEffect(() => {
    const storedUserId = sessionStorage.getItem('userId');
    if (!storedUserId) {
      setShowUserForm(true);
    } else {
      setUserId(storedUserId);
    }
  }, []);

  // Load posts on mount and when userId changes
  useEffect(() => {
    if (userId) {
      loadPosts();
    }
  }, [userId]);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check localStorage first
      const cachedPosts = getCachedPosts();
      const lastSync = getLastSync();

      let postsToDisplay = [];

      if (!cachedPosts || !lastSync) {
        // First load: fetch all posts
        const response = await getPosts(1, 50);
        postsToDisplay = response.posts || [];
        
        // Save to localStorage
        savePosts(postsToDisplay);
        setLastSync(new Date().toISOString());
      } else {
        // Subsequent loads: fetch only new posts
        try {
          const response = await getPosts(1, 50, lastSync);
          const newPosts = response.posts || [];
          
          if (newPosts.length > 0) {
            // Merge with cached posts
            postsToDisplay = mergePosts(cachedPosts, newPosts);
            savePosts(postsToDisplay);
            setLastSync(new Date().toISOString());
          } else {
            // No new posts, use cached
            postsToDisplay = cachedPosts;
          }
        } catch (err) {
          // If API fails, use cached posts
          console.warn('Failed to fetch new posts, using cache:', err);
          postsToDisplay = cachedPosts;
        }
      }

      setPosts(postsToDisplay);
    } catch (err) {
      setError(err.message || 'Error al cargar los posts');
      // Try to use cached posts as fallback
      const cachedPosts = getCachedPosts();
      if (cachedPosts) {
        setPosts(cachedPosts);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserSave = (savedUserId) => {
    setUserId(savedUserId);
    setShowUserForm(false);
  };

  const handlePostCreated = () => {
    loadPosts();
    setPrefillImageUrl(null);
  };

  const handlePostUpdated = () => {
    loadPosts();
    setSelectedPost(null);
  };

  const handlePostDeleted = () => {
    loadPosts();
    setSelectedPost(null);
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setShowSidebarPanel(true);
  };

  const handleDeletePost = (post) => {
    setSelectedPost(post);
    setShowSidebarPanel(true);
  };

  const handleSaveImage = (imageUrl) => {
    setPrefillImageUrl(imageUrl);
    setShowSidebarPanel(true);
  };

  const handleToggleSidebar = () => {
    setShowSidebarPanel(!showSidebarPanel);
    if (showSidebarPanel) {
      setSelectedPost(null);
      setPrefillImageUrl(null);
    }
  };

  if (showUserForm) {
    return <UserForm onSave={handleUserSave} />;
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="main-content" style={{ marginRight: showSidebarPanel ? '400px' : '0' }}>
        <div className="top-bar navbar navbar-expand-lg bg-white border-bottom position-sticky top-0" style={{ zIndex: 1000 }}>
          <div className="container-fluid px-4">
            <div className="d-flex align-items-center w-100">
              <div className="top-logo rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3" style={{ width: '48px', height: '48px', backgroundColor: '#e60023', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>P</div>
              <SearchBar />
              <div className="top-right d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
                <button 
                  className="btn btn-outline-danger btn-sm rounded-pill"
                  onClick={handleToggleSidebar}
                  title="Gestionar Posts"
                >
                  {showSidebarPanel ? 'Cerrar' : 'Gestionar'}
                </button>
                <button className="btn rounded-circle border-0 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: '#efefef' }}>
                  {userId ? userId.charAt(0).toUpperCase() : 'U'}
                </button>
                <button className="btn rounded-circle border-0 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: '#efefef' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="content-area bg-light" style={{ minHeight: 'calc(100vh - 80px)' }}>
          {error && (
            <div className="container-fluid px-4 pt-3">
              <div className="alert alert-warning" role="alert">
                {error}
              </div>
            </div>
          )}

          {loading && posts.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <>
              <Discovery onSaveImage={handleSaveImage} />
              {posts.length > 0 && (
                <div className="container-fluid px-4 pb-4">
                  <div className="row g-4" style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {posts.map((post) => (
                      <div key={post.id} className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2" style={{ display: 'flex' }}>
                        <ImageCard
                          post={post}
                          currentUserId={userId}
                          onEdit={handleEditPost}
                          onDelete={handleDeletePost}
                          onSave={handleSaveImage}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <SidebarPanel
        isOpen={showSidebarPanel}
        onClose={() => {
          setShowSidebarPanel(false);
          setSelectedPost(null);
          setPrefillImageUrl(null);
        }}
        selectedPost={selectedPost}
        onPostCreated={handlePostCreated}
        onPostUpdated={handlePostUpdated}
        onPostDeleted={handlePostDeleted}
        prefillImageUrl={prefillImageUrl}
      />
    </div>
  );
}

export default App;
