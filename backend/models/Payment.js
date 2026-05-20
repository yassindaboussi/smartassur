const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contract: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['en attente', 'payé', 'échoué'], default: 'en attente' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
