require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    const email = process.env.ADMIN_EMAIL || 'admin@smartassur.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123456';

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin existe déjà avec cet email:', email);
      process.exit(0);
    }

    await User.create({
      username: 'Administrateur',
      email,
      password: password,
      role: 'admin',
      phone: '+21624012345',
      address: 'Bardo',
      dateNaissance: new Date('1990-01-01'),
      isEmailVerified: true,
      emailVerificationToken: ''
    });

    console.log('✅ Compte admin créé avec succès!');
    console.log('Email:', email);
    console.log('Mot de passe:', password);
    process.exit(0);
  } catch (err) {
    console.error('Erreur:', err.message);
    process.exit(1);
  }
};

createAdmin();
