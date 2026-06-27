const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['burgery', 'pizza', 'napoje', 'desery', 'inne']
  },
  imageUrl: {
    type: String,
    default: ''
  },
  available: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    default: 15,
    comment: 'Czas przygotowania w minutach'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
