const Payment = require('../models/Payment');
const Contract = require('../models/Contract');
const User = require('../models/User');
const { sendPaymentSuccessEmail } = require('../services/emailService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// GET all payments
const getPayments = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const payments = await Payment.find(filter)
      .populate('contract', 'type numeroContrat price')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /payments/simulate (cash fallback)
const simulatePayment = async (req, res) => {
  try {
    const { contractId } = req.body;
    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });

    const payment = await Payment.create({
      user: req.user._id,
      contract: contractId,
      amount: contract.price,
      status: 'payé'
    });

    const user = await User.findById(req.user._id).select('username email');
    if (user?.email) {
      sendPaymentSuccessEmail(user.email, user.username, payment, contract).catch(console.error);
    }

    res.status(201).json({ message: 'Paiement simulé avec succès', payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /payments/create-checkout-session
const createCheckoutSession = async (req, res) => {
  try {
    const { contractId } = req.body;
    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    if (contract.status !== 'approved') return res.status(400).json({ message: 'Contrat non approuvé' });
    if (contract.paymentStatus === 'paid') return res.status(400).json({ message: 'Contrat déjà payé' });

    const amountCents = Math.round(contract.price * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Assurance ${contract.type} — SmartAssur`,
            description: `Contrat N° ${contract.numeroContrat || contractId}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      metadata: {
        contractId: contractId.toString(),
        userId: req.user._id.toString(),
      },
      success_url: `${process.env.FRONTEND_URL}/contrats/${contractId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/contrats/${contractId}?payment=cancelled`,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ message: err.message });
  }
};

// POST /payments/verify-and-activate
// Called by frontend when user lands back after Stripe redirect
// This is the LOCAL DEV fix — no webhook needed
const verifyAndActivate = async (req, res) => {
  try {
    const { contractId, sessionId } = req.body;

    // If sessionId provided, verify with Stripe directly
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ message: 'Paiement non confirmé par Stripe' });
      }
    }

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });

    // Already activated — idempotent
    if (contract.paymentStatus === 'paid') {
      return res.json({ message: 'Déjà activé', contract });
    }

    // Activate
    contract.status = 'active';
    contract.paymentStatus = 'paid';
    contract.paymentMethod = 'online';
    contract.paidAt = new Date();
    await contract.save();

    // Create payment record
    const existing = await Payment.findOne({ contract: contractId, status: 'payé' });
    if (!existing) {
      await Payment.create({
        user: req.user._id,
        contract: contractId,
        amount: contract.price,
        status: 'payé',
        stripeSessionId: sessionId || null,
      });
    }

    // Send confirmation email
    const user = await User.findById(req.user._id).select('username email');
    if (user?.email) {
      sendPaymentSuccessEmail(user.email, user.username, { amount: contract.price }, contract).catch(console.error);
    }

    res.json({ message: 'Contrat activé avec succès', contract });
  } catch (err) {
    console.error('verify-and-activate error:', err);
    res.status(500).json({ message: err.message });
  }
};

// POST /payments/webhook (for production)
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { contractId, userId } = session.metadata;
    try {
      const contract = await Contract.findById(contractId);
      if (contract && contract.paymentStatus !== 'paid') {
        contract.status = 'active';
        contract.paymentStatus = 'paid';
        contract.paymentMethod = 'online';
        contract.paidAt = new Date();
        await contract.save();

        const existing = await Payment.findOne({ contract: contractId, status: 'payé' });
        if (!existing) {
          await Payment.create({ user: userId, contract: contractId, amount: contract.price, status: 'payé', stripeSessionId: session.id });
        }

        const user = await User.findById(userId).select('username email');
        if (user?.email) {
          sendPaymentSuccessEmail(user.email, user.username, { amount: contract.price }, contract).catch(console.error);
        }
      }
    } catch (err) {
      console.error('Webhook handler error:', err);
    }
  }

  res.json({ received: true });
};

module.exports = { getPayments, simulatePayment, createCheckoutSession, verifyAndActivate, stripeWebhook };
