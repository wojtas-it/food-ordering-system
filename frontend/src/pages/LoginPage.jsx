import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(username, password);

      // Przekieruj w zależności od roli
      if (response.user.role === 'admin') {
        navigate('/admin');
      } else if (response.user.role === 'kucharz') {
        navigate('/kitchen');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Twoje konto oczekuje na zatwierdzenie przez administratora');
      } else if (err.response?.status === 401) {
        setError('Nieprawidłowa nazwa użytkownika lub hasło');
      } else {
        setError('Błąd logowania. Spróbuj ponownie.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Logowanie</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Nazwa użytkownika</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="Wprowadź nazwę użytkownika"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Wprowadź hasło"
              required
            />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" disabled={loading} className="btn-auth-primary">
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Nie masz konta?{' '}
            <Link to="/register" className="auth-link">
              Zarejestruj się
            </Link>
          </p>
          <button onClick={() => navigate('/kitchen-gate')} className="btn-back-link">
            ← Wróć
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
