const User = require('../models/User');
const Product = require('../models/Product');

// ========================================
// ZARZĄDZANIE UŻYTKOWNIKAMI
// ========================================

// Pobierz wszystkich użytkowników
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Błąd pobierania użytkowników', error: error.message });
  }
};

// Pobierz użytkowników oczekujących na akceptację
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'pending' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Błąd pobierania oczekujących użytkowników', error: error.message });
  }
};

// Akceptuj użytkownika
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    user.status = 'active';
    await user.save();

    res.json({
      message: `Użytkownik ${user.username} został zaakceptowany`,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd akceptacji użytkownika', error: error.message });
  }
};

// Odrzuć użytkownika
exports.rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    user.status = 'rejected';
    await user.save();

    res.json({
      message: `Użytkownik ${user.username} został odrzucony`,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd odrzucania użytkownika', error: error.message });
  }
};

// Zmień rolę użytkownika
exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'kucharz'].includes(role)) {
      return res.status(400).json({ message: 'Nieprawidłowa rola' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: `Rola użytkownika ${user.username} zmieniona na ${role}`,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd zmiany roli', error: error.message });
  }
};

// Usuń użytkownika
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Nie pozwól usunąć samego siebie
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Nie możesz usunąć własnego konta' });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    res.json({ message: `Użytkownik ${user.username} został usunięty` });
  } catch (error) {
    res.status(500).json({ message: 'Błąd usuwania użytkownika', error: error.message });
  }
};

// ========================================
// ZARZĄDZANIE PRODUKTAMI
// ========================================

// Dodaj nowy produkt
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, preparationTime } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      imageUrl,
      preparationTime
    });

    await product.save();

    res.status(201).json({
      message: 'Produkt dodany pomyślnie',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd dodawania produktu', error: error.message });
  }
};

// Aktualizuj produkt
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(id, updates, { new: true });

    if (!product) {
      return res.status(404).json({ message: 'Produkt nie znaleziony' });
    }

    res.json({
      message: 'Produkt zaktualizowany pomyślnie',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd aktualizacji produktu', error: error.message });
  }
};

// Usuń produkt
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: 'Produkt nie znaleziony' });
    }

    res.json({ message: `Produkt ${product.name} został usunięty` });
  } catch (error) {
    res.status(500).json({ message: 'Błąd usuwania produktu', error: error.message });
  }
};
