const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const { username, email, phone, address, dateNaissance, role, codePostal, idType, idNumber, password } = req.body;

    if (username) user.username = username;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (dateNaissance !== undefined) user.dateNaissance = dateNaissance;
    if (codePostal !== undefined) user.codePostal = codePostal;
    if (idType !== undefined) user.idType = idType;
    if (idNumber !== undefined) user.idNumber = idNumber;
    if (password && password.trim() !== '') user.password = password;
    if (req.user && req.user.role === 'admin' && role) user.role = role;

    // Handle profile image if uploaded
    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ message: 'Utilisateur mis à jour', user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    const { currentPassword, newPassword } = req.body;
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: 'Nouveau mot de passe trop court (min 6 caractères)' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, changePassword };
