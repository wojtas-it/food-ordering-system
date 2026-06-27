const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  pagerNumber: {
    type: String,
    default: null,
    comment: 'Numer pagera przypisany do zamówienia'
  },
  customerNotified: {
    type: Boolean,
    default: false,
    comment: 'Czy klient został powiadomiony (pager)'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Generowanie numeru zamówienia — krótki, czytelny, mieści się na OLED
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    this.orderNumber = `#${suffix}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
