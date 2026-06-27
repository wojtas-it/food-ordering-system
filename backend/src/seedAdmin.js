require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Połączono z MongoDB');
  } catch (error) {
    console.error('❌ Błąd połączenia:', error.message);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    await connectDB();

    // Sprawdź czy admin już istnieje
    const existingAdmin = await User.findOne({ username: 'admin' });

    if (existingAdmin) {
      console.log('ℹ️  Użytkownik admin już istnieje');
      process.exit(0);
    }

    // Utwórz domyślnego admina
    const admin = new User({
      username: 'admin',
      password: 'admin',
      role: 'admin',
      status: 'active'
    });

    await admin.save();

    console.log('✅ Domyślny administrator utworzony!');
    console.log('   Login: admin');
    console.log('   Hasło: admin');
    console.log('   Rola: admin');
    console.log('   Status: active');
    console.log('');
    console.log('⚠️  WAŻNE: Zmień hasło po pierwszym logowaniu!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Błąd seedowania admina:', error.message);
    process.exit(1);
  }
};

seedAdmin();
