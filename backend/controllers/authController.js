const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateVerificationToken, sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res) => {
  try {
    const { username, email, password, phone, address, dateNaissance, codePostal, idType, idNumber } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email déjà utilisé' });
    const profileImage = req.file ? `/uploads/${req.file.filename}` : '';
    const verificationToken = generateVerificationToken();
    const user = await User.create({
      username, email, password, phone, address, dateNaissance,
      codePostal, idType, idNumber, profileImage,
      emailVerificationToken: verificationToken
    });
    
    // Send verification email
    await sendVerificationEmail(email, verificationToken);
    
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      isEmailVerified: user.isEmailVerified,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if the input is an email or phone number
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    // Normalize phone number by removing spaces, dashes, etc.
    const normalizedPhone = email.replace(/[\s\-\(\)]/g, '');
    
    let user;
    if (isEmail) {
      // Search by email
      user = await User.findOne({ email });
    } else {
      // Try to find user by phone - first try exact match, then try partial match
      user = await User.findOne({ phone: normalizedPhone });
      
      // If not found and input doesn't start with +, try matching by last digits
      if (!user && !normalizedPhone.startsWith('+')) {
        // Find all users and match by phone digits (ignoring country code and formatting)
        const allUsers = await User.find({ phone: { $exists: true, $ne: null } });
        user = allUsers.find(u => {
          const dbPhoneNormalized = u.phone.replace(/[\s\-\(\)]/g, '');
          // Check if the last 8 digits match (for Tunisia numbers) or if input is contained in db phone
          return dbPhoneNormalized.endsWith(normalizedPhone) || 
                 dbPhoneNormalized.includes(normalizedPhone) ||
                 normalizedPhone.endsWith(dbPhoneNormalized);
        });
      }
    }
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Email, téléphone ou mot de passe incorrect' });
    }
    
    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        message: 'Veuillez vérifier votre email avant de vous connecter',
        requiresVerification: true,
        email: user.email
      });
    }
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      isEmailVerified: user.isEmailVerified,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email déjà vérifié' });
    }
    
    if (user.emailVerificationToken !== token) {
      return res.status(400).json({ message: 'Code de vérification incorrect' });
    }
    
    // Mark email as verified and clear token
    user.isEmailVerified = true;
    user.emailVerificationToken = '';
    await user.save();
    
    res.json({ message: 'Email vérifié avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email déjà vérifié' });
    }
    
    // Generate new token and send email
    const newToken = generateVerificationToken();
    user.emailVerificationToken = newToken;
    await user.save();
    
    const emailSent = await sendVerificationEmail(email, newToken);
    if (!emailSent) {
      return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email' });
    }
    
    res.json({ message: 'Code de vérification renvoyé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

// Step 1: User enters email → send reset code
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always return success to avoid revealing if email exists
    if (!user) return res.json({ message: 'Si cet email existe, un code a été envoyé.' });

    const token = generateVerificationToken();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    await sendPasswordResetEmail(email, token);
    res.json({ message: 'Si cet email existe, un code a été envoyé.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 2: User enters code + new password → reset
const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Code invalide ou expiré.' });
    if (user.resetPasswordToken !== token || Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Code invalide ou expiré.' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Mot de passe trop court (minimum 6 caractères).' });
    }

    user.password = newPassword;
    user.resetPasswordToken = '';
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, verifyEmail, resendVerificationEmail, getMe, forgotPassword, resetPassword };
