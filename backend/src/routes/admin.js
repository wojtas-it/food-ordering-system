const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Wszystkie endpointy wymagają autentykacji + roli admin
router.use(authenticate, requireAdmin);

// Zarządzanie użytkownikami
router.get('/users', adminController.getAllUsers);
router.get('/users/pending', adminController.getPendingUsers);
router.patch('/users/:id/approve', adminController.approveUser);
router.patch('/users/:id/reject', adminController.rejectUser);
router.patch('/users/:id/role', adminController.changeUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Zarządzanie produktami
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

module.exports = router;
