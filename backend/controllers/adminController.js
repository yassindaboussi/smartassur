const User = require('../models/User');
const Contract = require('../models/Contract');
const Claim = require('../models/Claim');
const Reclamation = require('../models/Reclamation');

const MONTH_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

const getStats = async (req, res) => {
  try {
    const [users, contracts, claims, reclamations] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Contract.find(),
      Claim.countDocuments(),
      Reclamation.countDocuments()
    ]);

    const paidContracts = contracts.filter(c => c.paymentStatus === 'paid');

    const totalRevenue = paidContracts.reduce((s, c) => s + (c.price || 0), 0);
    const activeContracts = contracts.filter(c => c.status === 'active').length;
    const pendingContracts = contracts.filter(c => c.status === 'pending').length;

    // Monthly revenue for the current year
    const now = new Date();
    const currentYear = now.getFullYear();

    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
      month: MONTH_LABELS[i],
      monthIndex: i,
      Auto: 0,
      Vie: 0,
      Vol: 0,
      total: 0,
    }));

    paidContracts.forEach(c => {
      const paidAt = c.paidAt ? new Date(c.paidAt) : new Date(c.updatedAt || c.createdAt);
      if (paidAt.getFullYear() === currentYear) {
        const m = paidAt.getMonth();
        const price = c.price || 0;
        monthlyRevenue[m].total += price;
        if (c.type === 'Auto') monthlyRevenue[m].Auto += price;
        else if (c.type === 'Vie') monthlyRevenue[m].Vie += price;
        else if (c.type === 'Vol') monthlyRevenue[m].Vol += price;
      }
    });

    // Revenue by type
    const revenueByType = {
      Auto: paidContracts.filter(c => c.type === 'Auto').reduce((s, c) => s + (c.price || 0), 0),
      Vie:  paidContracts.filter(c => c.type === 'Vie').reduce((s, c) => s + (c.price || 0), 0),
      Vol:  paidContracts.filter(c => c.type === 'Vol').reduce((s, c) => s + (c.price || 0), 0),
    };

    // Claims by status
    const claimDocs = await Claim.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      users,
      contracts: contracts.length,
      activeContracts,
      pendingContracts,
      claims,
      totalRevenue,
      revenueByType,
      monthlyRevenue,
      reclamations,
      claimsByStatus: claimDocs,
      year: currentYear,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats };
