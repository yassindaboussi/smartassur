const express = require('express');
const router = express.Router();
const {
  getPayments, simulatePayment, createCheckoutSession, verifyAndActivate, stripeWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Gestion des paiements (Stripe & simulation)
 */

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Webhook Stripe (usage interne uniquement)
 *     tags: [Payments]
 *     security: []
 *     description: Endpoint appelé automatiquement par Stripe. Ne pas appeler manuellement.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Événement reçu
 */
router.post('/webhook', stripeWebhook);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Lister les paiements (admin = tous, user = les siens)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des paiements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 */
router.get('/', protect, getPayments);

/**
 * @swagger
 * /payments/simulate:
 *   post:
 *     summary: Simuler un paiement (mode test)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contractId]
 *             properties:
 *               contractId:
 *                 type: string
 *                 description: ID du contrat à payer
 *     responses:
 *       200:
 *         description: Paiement simulé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 */
router.post('/simulate', protect, simulatePayment);

/**
 * @swagger
 * /payments/create-checkout-session:
 *   post:
 *     summary: Créer une session de paiement Stripe
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contractId]
 *             properties:
 *               contractId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session Stripe créée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL de redirection vers Stripe Checkout
 *                   example: "https://checkout.stripe.com/pay/cs_test_..."
 */
router.post('/create-checkout-session', protect, createCheckoutSession);

/**
 * @swagger
 * /payments/verify-and-activate:
 *   post:
 *     summary: Vérifier le paiement Stripe et activer le contrat
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId]
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: ID de la session Stripe retournée après paiement
 *     responses:
 *       200:
 *         description: Paiement vérifié et contrat activé
 *       400:
 *         description: Session invalide ou paiement non complété
 */
router.post('/verify-and-activate', protect, verifyAndActivate);

module.exports = router;
