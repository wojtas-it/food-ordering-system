import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../context/AuthContext';
import './KitchenDisplay.css';

const KitchenDisplay = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lastMessage } = useWebSocket();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Nasłuchuj na nowe zamówienia i zmiany statusu
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'NEW_ORDER') {
        setOrders((prev) => {
          // Sprawdź czy zamówienie już nie istnieje (zabezpieczenie przed duplikatami)
          if (prev.some(order => order._id === lastMessage.order._id)) {
            return prev;
          }
          return [lastMessage.order, ...prev];
        });
      } else if (lastMessage.type === 'ORDER_STATUS_UPDATED') {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === lastMessage.order._id ? lastMessage.order : order
          )
          // Usuń zamówienia completed/cancelled z panelu kuchni
          .filter(order => !['completed', 'cancelled'].includes(order.status))
        );
      } else if (lastMessage.type === 'ORDER_DELETED') {
        setOrders((prev) =>
          prev.filter((order) => order._id !== lastMessage.orderId)
        );
      }
    }
  }, [lastMessage]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      // Filtruj tylko aktywne zamówienia (nie completed/cancelled)
      const activeOrders = response.data.filter(
        (order) => !['completed', 'cancelled'].includes(order.status)
      );
      setOrders(activeOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Nie udało się załadować zamówień');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      // WebSocket automatycznie zaktualizuje listę - nie potrzeba loadOrders()
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Nie udało się zaktualizować statusu');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fbbf24',
      preparing: '#3b82f6',
      ready: '#10b981',
      completed: '#6b7280',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Oczekuje',
      preparing: 'W przygotowaniu',
      ready: 'Gotowe',
      completed: 'Zakończone',
      cancelled: 'Anulowane',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="kitchen-display">
        <div className="loading">Ładowanie zamówień...</div>
      </div>
    );
  }

  return (
    <div className="kitchen-display">
      <header className="kitchen-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Powrót
        </button>
        <div>
          <h1>Panel Kuchni</h1>
          {user && <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Zalogowany: {user.username}</p>}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-refresh" onClick={loadOrders}>
            🔄 Odśwież
          </button>
          <button className="btn-back" onClick={handleLogout}>
            Wyloguj
          </button>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>Brak aktywnych zamówień</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`order-card status-${order.status}`}
              style={{ borderLeftColor: getStatusColor(order.status) }}
            >
              <div className="order-card-header">
                <div className="order-number">{order.orderNumber}</div>
                <div className="pager-badge">📟 {order.pagerNumber}</div>
              </div>

              <div className="order-items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <span className="item-quantity">{item.quantity}x</span>
                    <span className="item-name">{item.name}</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="order-notes-kitchen">
                  <strong>Uwagi:</strong> {order.notes}
                </div>
              )}

              <div className="order-time">
                {new Date(order.createdAt).toLocaleTimeString('pl-PL')}
              </div>

              <div className="order-actions">
                {order.status === 'pending' && (
                  <button
                    className="btn-action btn-start"
                    onClick={() => updateOrderStatus(order._id, 'preparing')}
                  >
                    Rozpocznij przygotowanie
                  </button>
                )}

                {order.status === 'preparing' && (
                  <button
                    className="btn-action btn-ready"
                    onClick={() => updateOrderStatus(order._id, 'ready')}
                  >
                    Oznacz jako gotowe
                  </button>
                )}

                {order.status === 'ready' && (
                  <button
                    className="btn-action btn-complete"
                    onClick={() => updateOrderStatus(order._id, 'completed')}
                  >
                    Zakończ zamówienie
                  </button>
                )}

                <div className="status-indicator">
                  Status: <strong>{getStatusText(order.status)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;
