const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  dateNaissance: { type: Date, required: true },
  codePostal: { type: String, default: '' },
  idType: { type: String, enum: ['cin', 'sejour'], default: 'cin' },
  idNumber: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, default: '' },
  resetPasswordToken: { type: String, default: '' },
  resetPasswordExpires: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
