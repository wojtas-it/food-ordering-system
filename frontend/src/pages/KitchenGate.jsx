import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const KitchenGate = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === 'kuchnia') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Nieprawidłowe hasło');
      setPassword('');
    }
  };

  // Jeśli użytkownik jest już zalogowany, przekieruj do odpowiedniej strony
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'kucharz') {
        navigate('/kitchen', { replace: true });
      }
    }
  }, [user, navigate]);

  // Jeśli zalogowany, pokaż loading podczas przekierowania
  if (user) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="loading-state">Przekierowywanie...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h1 className="auth-title">🔒 Dostęp do Kuchni</h1>

          <form onSubmit={handlePasswordSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Hasło dostępu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Wprowadź hasło"
                autoFocus
              />
            </div>

            {error && <div className="error-box">{error}</div>}

            <button type="submit" className="btn-auth-primary">
              Kontynuuj
            </button>
          </form>

          <div className="auth-footer">
            <button onClick={() => navigate('/')} className="btn-back-link">
              ← Powrót do strony głównej
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Witaj w Systemie Kuchennym</h1>

        <div className="auth-buttons">
          <button onClick={() => navigate('/login')} className="btn-auth-primary">
            Zaloguj się
          </button>

          <button onClick={() => navigate('/register')} className="btn-auth-secondary">
            Zarejestruj nowe konto
          </button>
        </div>

        <div className="auth-footer">
          <button onClick={() => navigate('/')} className="btn-back-link">
            ← Powrót do strony głównej
          </button>
        </div>
      </div>
    </div>
  );
};

export default KitchenGate;
