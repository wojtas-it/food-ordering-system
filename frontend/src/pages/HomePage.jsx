import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleKitchenAccess = () => {
    navigate('/kitchen-gate');
  };

  return (
    <div className="home-page">
      {/* Mały przycisk Panel Kuchni w rogu */}
      <div className="kitchen-button-container">
        <button
          className="btn-kitchen"
          onClick={handleKitchenAccess}
        >
          🔒 Panel kuchni
        </button>
      </div>

      <div className="home-content">
        <h1 className="home-title">🍔 Witamy!</h1>
        <p className="home-subtitle">System samoobsługowego zamawiania</p>

        <div className="home-buttons">
          <button
            className="btn-order-main"
            onClick={() => navigate('/menu')}
          >
            Złóż zamówienie
          </button>
        </div>

        <div className="home-info">
          <div className="info-card">
            <div className="step-number">1</div>
            <span className="info-icon">📱</span>
            <h3>Wybierz produkty</h3>
            <p>Przeglądaj menu i dodawaj do koszyka</p>
          </div>

          <div className="info-card">
            <div className="step-number">2</div>
            <span className="info-icon">💳</span>
            <h3>Złóż zamówienie</h3>
            <p>Potwierdź i zapłać za zamówienie</p>
          </div>

          <div className="info-card">
            <div className="step-number">3</div>
            <span className="info-icon">📟</span>
            <h3>Odbierz pager</h3>
            <p>Pager powiadomi Cię, gdy jedzenie będzie gotowe</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;
