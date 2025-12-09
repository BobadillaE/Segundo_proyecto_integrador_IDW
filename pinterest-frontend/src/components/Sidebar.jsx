import '../css-styles/Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-logo">
          <div className="logo-circle">P</div>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Inicio</span>
          </a>
          <a href="#" className="nav-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Explorar</span>
          </a>
          <a href="#" className="nav-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>Guardados</span>
          </a>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;

