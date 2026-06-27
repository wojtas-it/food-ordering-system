const Product = require('../models/Product');

// Pobierz wszystkie produkty
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ available: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Pobierz produkty według kategorii
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category, available: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Dodaj nowy produkt
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Błąd tworzenia produktu', error: error.message });
  }
};

// Aktualizuj produkt
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Produkt nie znaleziony' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Błąd aktualizacji produktu', error: error.message });
  }
};

// Usuń produkt
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produkt nie znaleziony' });
    }
    res.json({ message: 'Produkt usunięty' });
  } catch (error) {
    res.status(500).json({ message: 'Błąd usuwania produktu', error: error.message });
  }
};
