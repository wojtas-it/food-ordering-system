const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET nie jest ustawiony w zmiennych środowiskowych');
}

// Middleware do weryfikacji JWT tokenu
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Brak tokenu autoryzacyjnego' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Użytkownik nie znaleziony' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Konto nieaktywne lub oczekuje na akceptację' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Nieprawidłowy token' });
  }
};

// Middleware do sprawdzania roli admin
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Wymagane uprawnienia administratora' });
  }
  next();
};

// Funkcja do generowania tokenu
exports.generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};
