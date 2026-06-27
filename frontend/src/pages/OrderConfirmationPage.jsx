import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import './OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  // Nasłuchuj na zmiany statusu zamówienia przez WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'ORDER_STATUS_UPDATED') {
      if (lastMessage.order._id === orderId) {
        setOrder(lastMessage.order);
      }
    }
  }, [lastMessage, orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getById(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error loading order:', error);
      alert('Nie udało się załadować zamówienia');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Oczekuje',
      preparing: 'W przygotowaniu',
      ready: 'Gotowe do odbioru!',
      completed: 'Zakończone',
      cancelled: 'Anulowane',
    };
    return statusMap[status] || status;
  };

  const getStatusEmoji = (status) => {
    const emojiMap = {
      pending: '⏳',
      preparing: '👨‍🍳',
      ready: '✅',
      completed: '🎉',
      cancelled: '❌',
    };
    return emojiMap[status] || '📋';
  };

  if (loading) {
    return (
      <div className="confirmation-page">
        <div className="loading">Ładowanie zamówienia...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="confirmation-page">
        <div className="error">Nie znaleziono zamówienia</div>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Powrót do strony głównej
        </button>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-content">
        <div className="success-icon">
          {order.status === 'ready' ? '🎉' : '✅'}
        </div>
        
        <h1>
          {order.status === 'ready' 
            ? 'Zamówienie gotowe!' 
            : 'Zamówienie przyjęte!'}
        </h1>
        
        <div className="order-number">
          Numer zamówienia: <strong>{order.orderNumber}</strong>
        </div>

        <div className="pager-info">
          <div className="pager-number">
            📟 Pager: <strong>{order.pagerNumber}</strong>
          </div>
          {order.status !== 'ready' && (
            <p className="pager-note">
              Pager powiadomi Cię, gdy zamówienie będzie gotowe do odbioru
            </p>
          )}
        </div>

        <div className="status-section">
          <div className={`status-badge status-${order.status}`}>
            {getStatusEmoji(order.status)} {getStatusText(order.status)}
          </div>
        </div>

        <div className="order-details">
          <h2>Twoje zamówienie:</h2>
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <span className="item-name">
                  {item.quantity}x {item.name}
                </span>
                <span className="item-price">
                  {(item.price * item.quantity).toFixed(2)} zł
                </span>
              </div>
            ))}
          </div>
          
          <div className="order-total">
            <span>Suma:</span>
            <span className="total-amount">{order.totalPrice.toFixed(2)} zł</span>
          </div>

          {order.notes && (
            <div className="order-notes">
              <strong>Uwagi:</strong> {order.notes}
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button 
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Powrót do strony głównej
          </button>
          
          {order.status !== 'ready' && (
            <button 
              className="btn-secondary"
              onClick={loadOrder}
            >
              Odśwież status
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
