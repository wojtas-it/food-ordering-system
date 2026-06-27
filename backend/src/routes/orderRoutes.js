const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// GET /api/orders - wszystkie zamówienia
router.get('/', orderController.getAllOrders);

// GET /api/orders/:id - zamówienie po ID
router.get('/:id', orderController.getOrderById);

// POST /api/orders - utwórz zamówienie
router.post('/', orderController.createOrder);

// PATCH /api/orders/:id/status - aktualizuj status zamówienia
router.patch('/:id/status', orderController.updateOrderStatus);

// DELETE /api/orders/:id - usuń zamówienie
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
