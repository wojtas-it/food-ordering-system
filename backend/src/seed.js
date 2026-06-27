require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Połączono z MongoDB');
  } catch (error) {
    console.error('❌ Błąd połączenia:', error.message);
    process.exit(1);
  }
};

const products = [
  {
    name: 'Burger Klasyczny',
    description: 'Soczysty burger z wołowiną, sałatą, pomidorem i sosem',
    price: 25.99,
    category: 'burgery',
    imageUrl: '/food_images/hamburger.jpg',
    preparationTime: 10
  },
  {
    name: 'Cheeseburger',
    description: 'Burger z podwójnym serem cheddar',
    price: 28.99,
    category: 'burgery',
    imageUrl: '/food_images/cheesburger.jpg',
    preparationTime: 10
  },
  {
    name: 'Pizza Margherita',
    description: 'Klasyczna pizza z sosem pomidorowym i mozzarellą',
    price: 32.00,
    category: 'pizza',
    imageUrl: '/food_images/margeritta.jpg',
    preparationTime: 20
  },
  {
    name: 'Pizza Pepperoni',
    description: 'Pizza z pikantnym salami pepperoni',
    price: 38.00,
    category: 'pizza',
    imageUrl: '/food_images/pepperoni.jpg',
    preparationTime: 20
  },
  {
    name: 'Coca Cola 0.5L',
    description: 'Orzeźwiający napój gazowany',
    price: 8.00,
    category: 'napoje',
    imageUrl: '/food_images/cola.jpg',
    preparationTime: 1
  },
  {
    name: 'Sprite 0.5L',
    description: 'Napój gazowany o smaku cytrynowo-limonkowym',
    price: 8.00,
    category: 'napoje',
    imageUrl: '/food_images/sprite.jpg',
    preparationTime: 1
  },
  {
    name: 'Woda mineralna 0.5L',
    description: 'Naturalna woda mineralna',
    price: 5.00,
    category: 'napoje',
    imageUrl: '/food_images/woda.jpg',
    preparationTime: 1
  },
  {
    name: 'Lody czekoladowe',
    description: 'Kremowe lody o smaku czekoladowym',
    price: 12.00,
    category: 'desery',
    imageUrl: '/food_images/lody_czek.jpg',
    preparationTime: 2
  },
  {
    name: 'Sernik',
    description: 'Domowy sernik na zimno',
    price: 15.00,
    category: 'desery',
    imageUrl: '/food_images/sernik.jpg',
    preparationTime: 2
  },
  {
    name: 'Frytki',
    description: 'Chrupiące frytki z solą',
    price: 10.00,
    category: 'inne',
    imageUrl: '/food_images/frytki.jpg',
    preparationTime: 7
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Wyczyść istniejące produkty
    await Product.deleteMany({});
    console.log('🗑️  Wyczyszczono istniejące produkty');

    // Dodaj nowe produkty
    await Product.insertMany(products);
    console.log(`✅ Dodano ${products.length} testowych produktów`);
    
    console.log('\n📦 Dodane produkty:');
    products.forEach(p => console.log(`   - ${p.name} (${p.price} zł)`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Błąd seedowania:', error.message);
    process.exit(1);
  }
};

seedDatabase();
