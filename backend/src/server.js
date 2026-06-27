require('dotenv').config();
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const connectDB = require('./config/database');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;
const WS_PORT = process.env.WS_PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Połączenie z bazą danych
connectDB();

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    service: 'Food Ordering Backend'
  });
});

// Podstawowy endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🍔 Food Ordering System API',
    version: '2.0.0',
    endpoints: {
      products: '/api/products',
      orders: '/api/orders',
      auth: '/api/auth',
      admin: '/api/admin',
      health: '/health'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint nie znaleziony' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Błąd serwera:', err.stack);
  res.status(500).json({ 
    message: 'Błąd serwera', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start HTTP Server
app.listen(PORT, () => {
  console.log(`🚀 Serwer HTTP działa na porcie ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
});

// WebSocket Server dla real-time updates
const wss = new WebSocket.Server({ port: WS_PORT });

// Globalny dostęp do WebSocket server (dla kontrolerów)
global.wss = wss;

wss.on('connection', (ws) => {
  console.log('🔌 Nowy klient WebSocket połączony');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 Otrzymano wiadomość:', data);
      
      // Echo back (możesz rozbudować logikę)
      ws.send(JSON.stringify({ 
        type: 'ACK', 
        message: 'Wiadomość otrzymana',
        timestamp: new Date()
      }));
    } catch (error) {
      console.error('❌ Błąd parsowania wiadomości:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Klient WebSocket rozłączony');
  });

  ws.on('error', (error) => {
    console.error('❌ Błąd WebSocket:', error);
  });

  // Wyślij powitanie
  ws.send(JSON.stringify({ 
    type: 'CONNECTED', 
    message: 'Połączono z serwerem WebSocket',
    timestamp: new Date()
  }));
});

console.log(`🔌 WebSocket działa na porcie ${WS_PORT}`);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Zamykanie serwera...');
  wss.close(() => {
    console.log('🔌 WebSocket zamknięty');
  });
  process.exit(0);
});
