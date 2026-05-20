const Claim = require('../models/Claim');
const User = require('../models/User');
const { sendClaimStatusEmail } = require('../services/emailService');

const getClaims = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const claims = await Claim.find(filter)
      .populate('user', 'username email phone')
      .populate('contract', 'type')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('user', 'username email phone')
      .populate('contract', 'type');
    if (!claim) return res.status(404).json({ message: 'Sinistre non trouvé' });
    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createClaim = async (req, res) => {
  try {
    const { contract, description } = req.body;
    const images = req.files ? req.files.map(f => f.filename) : [];
    const claim = await Claim.create({ user: req.user._id, contract, description, images });
    res.status(201).json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateClaim = async (req, res) => {
  try {
    const existingClaim = await Claim.findById(req.params.id);
    if (!existingClaim) return res.status(404).json({ message: 'Sinistre non trouvé' });
    const previousStatus = existingClaim.status;

    const { status, adminComment } = req.body;
    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      { status, adminComment },
      { new: true }
    ).populate('user', 'username email');

    if (!claim) return res.status(404).json({ message: 'Sinistre non trouvé' });

    // Send email if status changed
    if (status && status !== previousStatus && claim.user && claim.user.email) {
      sendClaimStatusEmail(claim.user.email, claim.user.username, claim).catch(console.error);
    }

    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateClaimByUser = async (req, res) => {
  try {
    const claim = await Claim.findOne({ _id: req.params.id, user: req.user._id });
    if (!claim) return res.status(404).json({ message: 'Sinistre non trouvé' });
    if (claim.status !== 'en attente') {
      return res.status(403).json({ message: 'Modification impossible : le sinistre est déjà en cours de traitement.' });
    }
    const { description, filesToRemove } = req.body;
    
    if (description) claim.description = description;
    
    // Handle file removals
    if (filesToRemove) {
      let filesToRemoveArray;
      try {
        filesToRemoveArray = JSON.parse(filesToRemove);
        if (Array.isArray(filesToRemoveArray)) {
          claim.images = claim.images.filter(img => !filesToRemoveArray.includes(img));
        }
      } catch (err) {
        console.error('Error parsing filesToRemove:', err);
      }
    }
    
    // Handle new images if provided - ADD to existing, not replace
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => f.filename);
      claim.images = [...claim.images, ...newImages];
    }
    
    await claim.save();
    const updated = await Claim.findById(claim._id).populate('user', 'username email phone').populate('contract', 'type');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getClaims, getClaimById, createClaim, updateClaim, updateClaimByUser };
