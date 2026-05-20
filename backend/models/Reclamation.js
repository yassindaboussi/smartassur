const mongoose = require('mongoose');
const reclamationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  contactPreference: { type: String, enum: ['email', 'phone'], default: 'email' },
  contactValue: { type: String, default: '' },
  status: { type: String, enum: ['en attente', 'en cours', 'résolu'], default: 'en attente' },
  adminResponse: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Reclamation', reclamationSchema);
