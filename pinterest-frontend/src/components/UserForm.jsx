import { useState } from 'react';
import '../css-styles/UserForm.css';

function UserForm({ onSave }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      sessionStorage.setItem('userId', username.trim());
      if (onSave) {
        onSave(username.trim());
      }
    }
  };

  return (
    <div className="user-form-container">
      <div className="user-form-card">
        <h2>Bienvenido a Pinterest Clone</h2>
        <p>Ingresa tu nombre de usuario para comenzar</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tu nombre de usuario"
            className="form-control mb-3"
            autoFocus
          />
          <button type="submit" className="btn btn-danger w-100">
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserForm;

