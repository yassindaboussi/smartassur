const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contract: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  status: { type: String, enum: ['en attente', 'en cours', 'approuvé', 'refusé'], default: 'en attente' },
  adminComment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Claim', claimSchema);
