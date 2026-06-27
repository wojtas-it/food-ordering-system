const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Publiczne endpointy
router.post('/register', authController.register);
router.post('/login', authController.login);

// Chroniony endpoint - informacje o zalogowanym użytkowniku
router.get('/me', authenticate, authController.getMe);

module.exports = router;
