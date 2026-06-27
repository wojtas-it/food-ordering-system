const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products - wszystkie produkty
router.get('/', productController.getAllProducts);

// GET /api/products/category/:category - produkty według kategorii
router.get('/category/:category', productController.getProductsByCategory);

// POST /api/products - dodaj produkt
router.post('/', productController.createProduct);

// PUT /api/products/:id - aktualizuj produkt
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id - usuń produkt
router.delete('/:id', productController.deleteProduct);

module.exports = router;
