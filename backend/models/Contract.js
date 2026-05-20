const mongoose = require('mongoose');

const autoSchema = new mongoose.Schema({
  modele: String,
  finition: { type: String, enum: ['Basique', 'Intermédiaire', 'Haut de gamme'] },
  valeurVenale: Number,
  valeurNeuf: Number,
  refPhoto: String,
  kilometrage: Number,
  boiteVitesse: { type: String, enum: ['Automatique', 'Manuelle'] },
  nbPortes: Number,
  radarRecul: { type: Boolean, default: false },
  alarme: { type: Boolean, default: false },
  alarmeCeinture: { type: Boolean, default: false },
  gps: { type: Boolean, default: false },
  abs: { type: Boolean, default: false },
  airbags: { type: Boolean, default: false },
  typeStationnement: { type: String, enum: ['Garage', 'Place de parking'] },
  cleDouble: { type: Boolean, default: false },
  autreConduct: { type: Boolean, default: false },
  permisAppartientAssure: { type: Boolean, default: true },
  typePermis: { type: String, enum: ['Tunisien', 'Étranger'] },
  categoriePermis: { type: String, enum: ['B', 'C', 'C+E', 'D', 'D1'] },
  numPermis: String,
  dateObtentionPermis: Date,
}, { _id: false });

const vieSchema = new mongoose.Schema({
  capitalEmprunte: Number,
  tauxInteret: Number,
  dureeRemboursement: Number,
  periodeFranchise: Number,
  periodicite: { type: String, enum: ['mensuelle', 'trimestrielle', 'semestrielle', 'annuelle'] },
  organismePreteur: String,
  dateDebutEffet: Date,
  dateNaissance: Date,
  nomAssure: String,
  prenomAssure: String,
  gsm: String,
  email: String,
  age: Number,
  taille: Number,
  poids: Number,
  fumeur: { type: Boolean, default: false },
  sportRisque: { type: Boolean, default: false },
  etatSante: String,
  maladiesChroniques: { type: Boolean, default: false },
  detailsMaladies: String,
  operationsChirurgicales: { type: Boolean, default: false },
  medicamentsRegulier: { type: Boolean, default: false },
  maladiesGraves: { type: Boolean, default: false },
  hospitalise: { type: Boolean, default: false },
  suiviSpecialiste: { type: Boolean, default: false },
  maladiesHereditaires: { type: Boolean, default: false },
  detailsHereditaires: String,
}, { _id: false });

const volSchema = new mongoose.Schema({
  dateEffet: Date,
  dateFin: Date,
  typeVoyage: { type: String, enum: ['Loisirs', 'Études', 'Business'] },
  voyageAvec: { type: String, enum: ['Seul', 'Accompagné'] },
  typeVoyageur: [String],
  dateDepart: Date,
  dateRetour: Date,
  destination: String,
  nom: String,
  prenom: String,
  dateNaissance: Date,
}, { _id: false });

const contractSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, enum: ['Auto', 'Vie', 'Vol'] },
  numeroContrat: { type: String, unique: true, sparse: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'active', 'rejected'],
    default: 'pending'
  },
  dossierSubmitted: { type: Boolean, default: false }, // true = client sent all docs to admin
  price: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
  autoData: autoSchema,
  vieData: vieSchema,
  volData: volSchema,
  documents: [{
    name: String,
    label: String,
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
    required: { type: Boolean, default: true }
  }],
  paymentStatus: { type: String, enum: ['unpaid', 'pending_cash', 'paid'], default: 'unpaid' },
  paymentMethod: { type: String, enum: ['online', 'cash', null], default: null },
  paidAt: Date,
  adminNote: String,
  clientSignature: { type: String, default: null }, // base64 PNG
  signedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

contractSchema.pre('save', async function(next) {
  if (!this.numeroContrat && this.status !== 'draft') {
    const prefix = this.type === 'Auto' ? 'AUT' : this.type === 'Vie' ? 'VIE' : 'VOL';
    const digits = Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3,'0');
    this.numeroContrat = `${prefix}0000${digits}`.slice(0, 22);
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Contract', contractSchema);
