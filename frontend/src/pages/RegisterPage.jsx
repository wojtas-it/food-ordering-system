import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Walidacja
    if (password.length < 4) {
      setError('Hasło musi mieć co najmniej 4 znaki');
      return;
    }

    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne');
      return;
    }

    setLoading(true);

    try {
      await register(username, password);
      setSuccess(true);
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Nazwa użytkownika jest już zajęta');
      } else {
        setError('Błąd rejestracji. Spróbuj ponownie.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h1 className="success-title">Rejestracja zakończona!</h1>
            <p className="success-message">
              Twoje konto oczekuje na zatwierdzenie przez administratora.
              Otrzymasz dostęp do systemu po akceptacji.
            </p>
            <button onClick={() => navigate('/login')} className="btn-auth-primary">
              Przejdź do logowania
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Rejestracja</h1>

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
              placeholder="Wprowadź hasło (min. 4 znaki)"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Potwierdź hasło</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="Wprowadź hasło ponownie"
              required
            />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" disabled={loading} className="btn-auth-primary">
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Masz już konto?{' '}
            <Link to="/login" className="auth-link">
              Zaloguj się
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

export default RegisterPage;
