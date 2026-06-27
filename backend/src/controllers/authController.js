const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// Rejestracja nowego użytkownika
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Sprawdź czy użytkownik już istnieje
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Użytkownik o tej nazwie już istnieje' });
    }

    // Utwórz nowego użytkownika (status: pending)
    const user = new User({
      username,
      password,
      role: 'kucharz',
      status: 'pending'
    });

    await user.save();

    res.status(201).json({
      message: 'Konto utworzone! Oczekuje na akceptację administratora.',
      user: {
        id: user._id,
        username: user.username,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Błąd rejestracji:', error);
    res.status(500).json({ message: 'Błąd rejestracji' });
  }
};

// Logowanie użytkownika
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Znajdź użytkownika
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Nieprawidłowa nazwa użytkownika lub hasło' });
    }

    // Sprawdź hasło
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Nieprawidłowa nazwa użytkownika lub hasło' });
    }

    // Sprawdź status konta
    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Konto oczekuje na akceptację administratora' });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ message: 'Konto zostało odrzucone przez administratora' });
    }

    // Wygeneruj token
    const token = generateToken(user._id);

    res.json({
      message: 'Zalogowano pomyślnie',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Błąd logowania:', error);
    res.status(500).json({ message: 'Błąd logowania' });
  }
};

// Pobranie informacji o zalogowanym użytkowniku
exports.getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role,
      status: req.user.status
    }
  });
};
