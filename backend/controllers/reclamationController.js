const Reclamation = require('../models/Reclamation');
const { sendReclamationStatusEmail } = require('../services/emailService');

const getReclamations = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const reclamations = await Reclamation.find(filter)
      .populate('user', 'username email phone')
      .sort({ createdAt: -1 });
    res.json(reclamations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createReclamation = async (req, res) => {
  try {
    const { subject, description, contactPreference, contactValue } = req.body;
    const images = req.files ? req.files.map(f => f.filename) : [];
    const reclamation = await Reclamation.create({
      user: req.user._id,
      subject,
      description,
      images,
      contactPreference: contactPreference || 'email',
      contactValue: contactValue || '',
    });
    res.status(201).json(reclamation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateReclamation = async (req, res) => {
  try {
    const existingRec = await Reclamation.findById(req.params.id).populate('user', 'username email');
    if (!existingRec) return res.status(404).json({ message: 'Réclamation non trouvée' });
    const previousStatus = existingRec.status;

    const { status, adminResponse } = req.body;
    const reclamation = await Reclamation.findByIdAndUpdate(
      req.params.id,
      { status, adminResponse },
      { new: true }
    ).populate('user', 'username email');

    if (!reclamation) return res.status(404).json({ message: 'Réclamation non trouvée' });

    // Send email if status changed
    if (status && status !== previousStatus && reclamation.user && reclamation.user.email) {
      sendReclamationStatusEmail(reclamation.user.email, reclamation.user.username, reclamation).catch(console.error);
    }

    res.json(reclamation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateReclamationByUser = async (req, res) => {
  try {
    const reclamation = await Reclamation.findOne({ _id: req.params.id, user: req.user._id });
    if (!reclamation) return res.status(404).json({ message: 'Réclamation non trouvée' });
    if (reclamation.status !== 'en attente') {
      return res.status(403).json({ message: 'Modification impossible : la réclamation est déjà en cours de traitement.' });
    }
    const { subject, description, contactPreference, contactValue, filesToRemove } = req.body;
    if (subject) reclamation.subject = subject;
    if (description) reclamation.description = description;
    if (contactPreference) reclamation.contactPreference = contactPreference;
    if (contactValue !== undefined) reclamation.contactValue = contactValue;

    // Handle image removals
    if (filesToRemove) {
      try {
        const toRemove = JSON.parse(filesToRemove);
        if (Array.isArray(toRemove)) {
          reclamation.images = reclamation.images.filter(img => !toRemove.includes(img));
        }
      } catch (e) { console.error('filesToRemove parse error', e); }
    }

    // Add new images
    if (req.files && req.files.length > 0) {
      reclamation.images = [...reclamation.images, ...req.files.map(f => f.filename)];
    }

    await reclamation.save();
    res.json(reclamation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteReclamation = async (req, res) => {
  try {
    await Reclamation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Réclamation supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getReclamations, createReclamation, updateReclamation, updateReclamationByUser, deleteReclamation };
