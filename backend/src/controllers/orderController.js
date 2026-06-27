const Order = require('../models/Order');
const { notifyPager } = require('../services/pagerService');

// Pobierz wszystkie zamówienia
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Pobierz zamówienie po ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Zamówienie nie znalezione' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Utwórz nowe zamówienie
exports.createOrder = async (req, res) => {
  try {
    const { items, notes, pagerNumber } = req.body;
    
    // Oblicz całkowitą cenę
    const totalPrice = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const order = new Order({
      items,
      totalPrice,
      notes,
      pagerNumber,
      status: 'pending'
    });

    await order.save();
    await order.populate('items.product');

    // Powiadom pager o nowym zamówieniu (status: pending)
    if (order.pagerNumber) {
      await notifyPager(order.pagerNumber, order.orderNumber, 'pending');
    }

    // Rozgłoś nowe zamówienie przez WebSocket
    if (global.wss) {
      global.wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify({
            type: 'NEW_ORDER',
            order: order
          }));
        }
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Błąd tworzenia zamówienia', error: error.message });
  }
};

// Aktualizuj status zamówienia
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Zamówienie nie znalezione' });
    }

    order.status = status;

    // Powiadom pager o każdej zmianie statusu
    if (order.pagerNumber) {
      await notifyPager(order.pagerNumber, order.orderNumber, status);

      // Oznacz jako powiadomiony tylko gdy ready
      if (status === 'ready' && !order.customerNotified) {
        order.customerNotified = true;
      }
    }

    await order.save();
    await order.populate('items.product');

    // Rozgłoś zmianę statusu przez WebSocket
    if (global.wss) {
      global.wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'ORDER_STATUS_UPDATED',
            order: order
          }));
        }
      });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Błąd aktualizacji zamówienia', error: error.message });
  }
};

// Usuń zamówienie
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Zamówienie nie znalezione' });
    }

    // Rozgłoś usunięcie przez WebSocket
    if (global.wss) {
      global.wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'ORDER_DELETED',
            orderId: req.params.id
          }));
        }
      });
    }

    res.json({ message: 'Zamówienie usunięte' });
  } catch (error) {
    res.status(500).json({ message: 'Błąd usuwania zamówienia', error: error.message });
  }
};
