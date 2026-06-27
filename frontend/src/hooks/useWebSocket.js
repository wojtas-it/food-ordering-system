import { useEffect, useState, useRef } from 'react';

// Automatyczne wykrywanie IP dla WebSocket
const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  // Jeśli brak .env, użyj obecnego hosta (automatyczne IP)
  const hostname = window.location.hostname;
  return `ws://${hostname}:5001`;
};

const WS_URL = getWsUrl();

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('✅ WebSocket połączony');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 Otrzymano wiadomość:', data);
            setLastMessage(data);
          } catch (error) {
            console.error('❌ Błąd parsowania wiadomości:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('❌ Błąd WebSocket:', error);
        };

        ws.onclose = () => {
          console.log('🔌 WebSocket rozłączony');
          setIsConnected(false);
          
          // Próba ponownego połączenia po 3 sekundach
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Próba ponownego połączenia...');
            connect();
          }, 3000);
        };
      } catch (error) {
        console.error('❌ Błąd połączenia WebSocket:', error);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket nie jest połączony');
    }
  };

  return { isConnected, lastMessage, sendMessage };
};
