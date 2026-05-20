const Contract = require('../models/Contract');
const User = require('../models/User');
const { sendContractStatusEmail } = require('../services/emailService');

function calculatePremium(type, data) {

  // ─── ASSURANCE AUTO (Tous Risques) ───────────────────────────────────────
  // Base: ~3% de la valeur vénale (marché tunisien: 2.5%–4%)
  if (type === 'Auto') {
    const valeur = parseFloat(data.valeurVenale) || 0;

    // Taux de base tous risques: 3% valeur vénale
    let prime = valeur * 0.030;

    // Boîte automatique: +7% (pièces plus chères, réparation plus coûteuse)
    if (data.boiteVitesse === 'Automatique') prime *= 1.07;

    // Stationnement garage: -5% (risque vol/vandalisme réduit)
    if (data.typeStationnement === 'Garage') prime *= 0.95;

    // Équipements antivol/sécurité (réductions pratiquées sur le marché TN)
    if (data.alarme)   prime *= 0.97; // -3%
    if (data.gps)      prime *= 0.97; // -3%
    if (data.abs)      prime *= 0.98; // -2%
    if (data.airbags)  prime *= 0.98; // -2%

    // Conducteur supplémentaire déclaré: +10% (risque partagé)
    if (data.autreConduct) prime *= 1.10;

    // Finition du véhicule (coût de réparation / valeur des pièces)
    if (data.finition === 'Haut de gamme')   prime *= 1.15; // +15%
    else if (data.finition === 'Intermédiaire') prime *= 1.07; // +7%

    // Prime minimale légale: 200 DT (RC obligatoire de base)
    return Math.max(Math.round(prime * 100) / 100, 200);
  }

  // ─── ASSURANCE VIE / DÉCÈS (Temporaire décès – couverture emprunt) ────────
  // Prime annuelle = Capital × taux annuel selon l'âge
  // Taux de base (adulte sain, non-fumeur):
  //   < 35 ans : 0.25% / an
  //   35–44    : 0.40% / an
  //   45–54    : 0.70% / an
  //   55–64    : 1.20% / an
  //   ≥ 65     : 2.00% / an
  if (type === 'Vie') {
    const capital = parseFloat(data.capitalEmprunte) || 0;
    const age = parseInt(data.age) || 30;

    let tauxAnnuel;
    if      (age < 35)  tauxAnnuel = 0.0025;
    else if (age < 45)  tauxAnnuel = 0.0040;
    else if (age < 55)  tauxAnnuel = 0.0070;
    else if (age < 65)  tauxAnnuel = 0.0120;
    else                tauxAnnuel = 0.0200;

    // Surprimes de risque (pratique standard des assureurs tunisiens)
    if (data.fumeur)           tauxAnnuel *= 1.50; // +50% fumeur
    if (data.sportRisque)      tauxAnnuel *= 1.25; // +25% sport à risque
    if (data.maladiesChroniques) tauxAnnuel *= 1.40; // +40% maladies chroniques
    if (data.maladiesGraves)   tauxAnnuel *= 2.00; // +100% maladies graves (ou refus)

    // Prime annuelle = capital × taux
    const primeAnnuelle = capital * tauxAnnuel;

    // Prime minimale: 80 DT/an
    return Math.max(Math.round(primeAnnuelle * 100) / 100, 80);
  }

  // ─── ASSURANCE VOYAGE (Assistance aux personnes en voyage) ────────────────
  // Base individuel Zone Schengen/Monde:
  //   Tourisme   : ~10 DT/personne/jour
  //   Business   : ~16 DT/personne/jour (Pack Business – plafonds plus élevés)
  //   Études     : ~8  DT/personne/jour (Pack Étudiant – tarif préférentiel)
  if (type === 'Vol') {
    const dateDepart = data.dateDepart ? new Date(data.dateDepart) : new Date();
    const dateRetour = data.dateRetour ? new Date(data.dateRetour) : new Date();
    const jours = Math.max(1, Math.ceil((dateRetour - dateDepart) / (1000 * 60 * 60 * 24)));

    // Tarif journalier de base par personne selon le type de voyage
    let tarifJour;
    if      (data.typeVoyage === 'Business') tarifJour = 16;
    else if (data.typeVoyage === 'Études')   tarifJour = 8;
    else                                      tarifJour = 10; // Tourisme/défaut

    // Formule famille: réduction ~20% sur le tarif total
    // (offre "famille" pratiquée par STAR, GAT, BH)
    let coeffVoyage = 1.0;
    if (data.voyageAvec === 'Accompagné') coeffVoyage = 0.80;

    // Voyageurs et réduction enfant
    const raw = data.typeVoyageur || [];
    const voyageurs = Array.isArray(raw) ? raw : [raw];
    const nbVoyageurs = Math.max(1, voyageurs.length);
    const nbEnfants = voyageurs.filter(v => v === 'Enfant').length;

    // Enfants: -50% du tarif individuel (pratique marché TN)
    const nbAdultes = nbVoyageurs - nbEnfants;
    const primeAdultes  = nbAdultes  * tarifJour * jours;
    const primeEnfants  = nbEnfants  * tarifJour * 0.50 * jours;

    const prime = (primeAdultes + primeEnfants) * coeffVoyage;

    // Prime minimale: 30 DT (court séjour individuel)
    return Math.max(Math.round(prime * 100) / 100, 30);
  }

  return 0;
}

const getContracts = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const contracts = await Contract.find(filter)
      .populate('user', 'username email phone address idType idNumber dateNaissance')
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id).populate('user', 'username email phone address idType idNumber dateNaissance');
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    if (req.user.role !== 'admin' && contract.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Accès refusé' });
    res.json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createContract = async (req, res) => {
  try {
    const { type, autoData, vieData, volData } = req.body;
    const typeData = type === 'Auto' ? autoData : type === 'Vie' ? vieData : volData;
    const price = calculatePremium(type, typeData || {});

    let startDate = new Date();
    let endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    if (type === 'Vol' && volData?.dateEffet) {
      startDate = new Date(volData.dateEffet);
      endDate = new Date(volData.dateFin || startDate);
    }
    if (type === 'Vie' && vieData?.dateDebutEffet) {
      startDate = new Date(vieData.dateDebutEffet);
      const duree = parseInt(vieData.dureeRemboursement) || 12;
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + duree);
    }

    const prefix = type === 'Auto' ? 'AUT' : type === 'Vie' ? 'VIE' : 'VOL';
    const digits = Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const numeroContrat = `${prefix}0000${digits}`.slice(0, 22);

    const contract = new Contract({
      user: req.user._id,
      type,
      status: 'pending',   // Directly pending — client must now upload docs
      price,
      startDate,
      endDate,
      numeroContrat,
      autoData: type === 'Auto' ? autoData : undefined,
      vieData: type === 'Vie' ? vieData : undefined,
      volData: type === 'Vol' ? volData : undefined,
    });

    await contract.save();
    res.status(201).json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });

    const { status, adminNote, paymentMethod } = req.body;
    const previousStatus = contract.status;

    // Admin can only set: pending, approved, rejected
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      contract.status = status;
    }
    if (adminNote !== undefined) contract.adminNote = adminNote;
    if (paymentMethod) contract.paymentMethod = paymentMethod;

    await contract.save();

    // Send email notification if status changed
    if (status && status !== previousStatus) {
      try {
        const populatedContract = await Contract.findById(contract._id).populate('user', 'username email');
        if (populatedContract && populatedContract.user && populatedContract.user.email) {
          sendContractStatusEmail(
            populatedContract.user.email,
            populatedContract.user.username,
            populatedContract
          ).catch(console.error);
        }
      } catch (emailErr) {
        console.error('Error sending contract status email:', emailErr);
      }
    }

    res.json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const uploadDocument = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    if (req.user.role !== 'admin' && contract.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Accès refusé' });

    const { docName, docLabel, required } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'Aucun fichier fourni' });

    contract.documents = contract.documents.filter(d => d.name !== docName);
    contract.documents.push({
      name: docName,
      label: docLabel || docName,
      filename: file.filename,
      url: `/uploads/${file.filename}`,
      required: required !== 'false',
    });

    await contract.save();
    res.json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Client submits complete dossier to admin (all required docs uploaded)
const submitDossier = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    if (contract.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Accès refusé' });

    // Mark as submitted to admin (still "pending" status, but dossierSubmitted flag)
    contract.dossierSubmitted = true;
    await contract.save();
    res.json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const payContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    if (contract.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Accès refusé' });
    if (contract.status !== 'approved')
      return res.status(400).json({ message: 'Contrat non approuvé' });

    const { method } = req.body;
    contract.paymentMethod = method;

    if (method === 'online') {
      contract.status = 'active';
      contract.paymentStatus = 'paid';
      contract.paidAt = new Date();
    } else {
      contract.paymentStatus = 'pending_cash';
    }

    await contract.save();
    res.json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Client switches from cash to online
const switchToOnline = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    if (contract.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Accès refusé' });
    if (contract.paymentStatus !== 'pending_cash')
      return res.status(400).json({ message: 'Paiement non en attente cash' });

    // Reset to unpaid — frontend will redirect to Stripe which activates on success
    contract.paymentMethod = null;
    contract.paymentStatus = 'unpaid';
    await contract.save();
    res.json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const validateCashPayment = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    contract.status = 'active';
    contract.paymentStatus = 'paid';
    contract.paidAt = new Date();
    await contract.save();

    // Notify client that contract is now active
    try {
      const populatedContract = await Contract.findById(contract._id).populate('user', 'username email');
      if (populatedContract && populatedContract.user && populatedContract.user.email) {
        sendContractStatusEmail(
          populatedContract.user.email,
          populatedContract.user.username,
          populatedContract
        ).catch(console.error);
      }
    } catch (emailErr) {
      console.error('Error sending contract active email:', emailErr);
    }

    res.json(contract);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const calculatePrice = async (req, res) => {
  try {
    const { type, data } = req.body;
    res.json({ price: calculatePremium(type, data || {}) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteContract = async (req, res) => {
  try {
    await Contract.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contrat supprimé' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// exports moved to bottom

// POST /:id/sign — client saves their drawn signature (base64 PNG)
const signContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    if (contract.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Accès refusé' });

    const { signature } = req.body; // base64 data URL
    if (!signature || !signature.startsWith('data:image/png;base64,'))
      return res.status(400).json({ message: 'Signature invalide' });

    contract.clientSignature = signature;
    contract.signedAt = new Date();
    await contract.save();
    res.json({ message: 'Signature enregistrée', signedAt: contract.signedAt });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  getContracts, getContractById, createContract, updateContract,
  uploadDocument, submitDossier, payContract, switchToOnline,
  validateCashPayment, calculatePrice, deleteContract, signContract
};
