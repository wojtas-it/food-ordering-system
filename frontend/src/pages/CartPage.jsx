import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../services/api';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [pagerNumber, setPagerNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      alert('Koszyk jest pusty!');
      return;
    }

    if (!pagerNumber.trim()) {
      alert('Proszę podać numer pagera!');
      return;
    }

    if (!paymentMethod) {
      alert('Proszę wybrać metodę płatności!');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSimulation = async () => {
    setIsProcessingPayment(true);

    // Symulacja płatności - opóźnienie 2 sekundy
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      setIsSubmitting(true);

      const orderData = {
        items: cart.map((item) => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        pagerNumber: pagerNumber.trim(),
        notes: notes.trim(),
      };

      const response = await ordersAPI.create(orderData);
      const order = response.data;

      // Wyczyść koszyk
      clearCart();
      setShowPaymentModal(false);

      // Przejdź do strony potwierdzenia
      navigate(`/confirmation/${order._id}`);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Błąd podczas składania zamówienia. Spróbuj ponownie.');
      setShowPaymentModal(false);
    } finally {
      setIsSubmitting(false);
      setIsProcessingPayment(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <header className="cart-header">
          <button className="btn-back" onClick={() => navigate('/menu')}>
            ← Powrót do menu
          </button>
          <h1>Koszyk</h1>
        </header>
        <div className="empty-cart">
          <p>Twój koszyk jest pusty</p>
          <button className="btn-primary" onClick={() => navigate('/menu')}>
            Przeglądaj menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <header className="cart-header">
        <button className="btn-back" onClick={() => navigate('/menu')}>
          ← Powrót do menu
        </button>
        <h1>Koszyk</h1>
      </header>

      <div className="cart-content">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="cart-item-image"
              />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="cart-item-price">{item.price.toFixed(2)} zł</p>
              </div>
              <div className="cart-item-actions">
                <div className="quantity-controls">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="btn-quantity"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="btn-quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="btn-remove"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="order-details">
            <h2>Szczegóły zamówienia</h2>

            <div className="form-group">
              <label htmlFor="pagerNumber">Numer pagera *</label>
              <input
                id="pagerNumber"
                type="text"
                value={pagerNumber}
                onChange={(e) => setPagerNumber(e.target.value)}
                placeholder="np. P001"
                className="input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Uwagi do zamówienia</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dodatkowe informacje..."
                className="textarea"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Metoda płatności *</label>
              <div className="payment-methods">
                <button
                  type="button"
                  className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <span className="payment-icon">💳</span>
                  <span>Karta płatnicza</span>
                </button>
                <button
                  type="button"
                  className={`payment-option ${paymentMethod === 'blik' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('blik')}
                >
                  <span className="payment-icon">📱</span>
                  <span>BLIK</span>
                </button>
              </div>
            </div>
          </div>

          <div className="total-section">
            <div className="total-row">
              <span>Suma:</span>
              <span className="total-price">{getTotalPrice().toFixed(2)} zł</span>
            </div>
          </div>

          <button
            className="btn-submit"
            onClick={handleProceedToPayment}
            disabled={isSubmitting}
          >
            Przejdź do płatności
          </button>
        </div>
      </div>

      {/* Modal płatności */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content payment-modal">
            <h2>
              {paymentMethod === 'card' ? '💳 Płatność kartą' : '📱 Płatność BLIK'}
            </h2>

            {!isProcessingPayment ? (
              <>
                <p className="payment-info">
                  {paymentMethod === 'card'
                    ? 'Symulacja płatności kartą płatniczą'
                    : 'Symulacja płatności kodem BLIK'
                  }
                </p>
                <div className="payment-amount">
                  <span>Do zapłaty:</span>
                  <span className="amount">{getTotalPrice().toFixed(2)} zł</span>
                </div>

                {paymentMethod === 'blik' && (
                  <div className="form-group">
                    <label>Kod BLIK</label>
                    <input
                      type="text"
                      className="input blik-input"
                      placeholder="000 000"
                      maxLength="6"
                      disabled
                    />
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="card-simulation">
                    <div className="form-group">
                      <label>Numer karty</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="0000 0000 0000 0000"
                        disabled
                      />
                    </div>
                    <div className="card-row">
                      <div className="form-group">
                        <label>Data ważności</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="MM/RR"
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="000"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="modal-buttons">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handlePaymentSimulation}
                  >
                    Zapłać
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Anuluj
                  </button>
                </div>
              </>
            ) : (
              <div className="processing-payment">
                <div className="spinner"></div>
                <p>Przetwarzanie płatności...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
