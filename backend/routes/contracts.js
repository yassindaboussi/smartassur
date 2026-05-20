const express = require('express');
const router = express.Router();
const {
  getContracts, getContractById, createContract, updateContract,
  uploadDocument, submitDossier, payContract, switchToOnline,
  validateCashPayment, calculatePrice, deleteContract, signContract
} = require('../controllers/contractController');
const { protect, adminOnly } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

/**
 * @swagger
 * tags:
 *   name: Contracts
 *   description: Gestion des contrats d'assurance (Auto, Vie, Vol)
 */

/**
 * @swagger
 * /contracts:
 *   get:
 *     summary: Lister les contrats (admin = tous, user = les siens)
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des contrats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contract'
 */
router.get('/', protect, getContracts);

/**
 * @swagger
 * /contracts/calculate:
 *   post:
 *     summary: Calculer le prix d'un contrat avant création
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [Auto, Vie, Vol]
 *               autoData:
 *                 type: object
 *                 description: Données spécifiques au contrat Auto
 *               vieData:
 *                 type: object
 *                 description: Données spécifiques au contrat Vie
 *               volData:
 *                 type: object
 *                 description: Données spécifiques au contrat Vol
 *     responses:
 *       200:
 *         description: Prix calculé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 price:
 *                   type: number
 *                   example: 450
 */
router.post('/calculate', protect, calculatePrice);

/**
 * @swagger
 * /contracts:
 *   post:
 *     summary: Créer un nouveau contrat
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [Auto, Vie, Vol]
 *               autoData:
 *                 type: object
 *               vieData:
 *                 type: object
 *               volData:
 *                 type: object
 *     responses:
 *       201:
 *         description: Contrat créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contract'
 */
router.post('/', protect, createContract);

/**
 * @swagger
 * /contracts/{id}:
 *   get:
 *     summary: Récupérer un contrat par ID
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Données du contrat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contract'
 *       404:
 *         description: Contrat non trouvé
 */
router.get('/:id', protect, getContractById);

/**
 * @swagger
 * /contracts/{id}:
 *   put:
 *     summary: Mettre à jour un contrat
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, active, rejected]
 *               adminNote:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Contrat mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contract'
 */
router.put('/:id', protect, updateContract);

/**
 * @swagger
 * /contracts/{id}/documents:
 *   post:
 *     summary: Uploader un document pour un contrat
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, name]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *                 description: Identifiant interne du document (ex. carte_grise)
 *               label:
 *                 type: string
 *                 description: Libellé affiché (ex. Carte grise)
 *     responses:
 *       200:
 *         description: Document uploadé avec succès
 */
router.post('/:id/documents', protect, upload.single('file'), uploadDocument);

/**
 * @swagger
 * /contracts/{id}/submit-dossier:
 *   post:
 *     summary: Soumettre le dossier à l'administrateur
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dossier soumis avec succès
 *       400:
 *         description: Documents manquants
 */
router.post('/:id/submit-dossier', protect, submitDossier);

/**
 * @swagger
 * /contracts/{id}/pay:
 *   post:
 *     summary: Déclencher le paiement d'un contrat
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [online, cash]
 *     responses:
 *       200:
 *         description: Paiement initié
 */
router.post('/:id/pay', protect, payContract);

/**
 * @swagger
 * /contracts/{id}/switch-online:
 *   post:
 *     summary: Passer d'un paiement cash à un paiement en ligne
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mode de paiement changé en ligne
 */
router.post('/:id/switch-online', protect, switchToOnline);

/**
 * @swagger
 * /contracts/{id}/validate-cash:
 *   post:
 *     summary: Valider un paiement cash (admin uniquement)
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paiement cash validé
 *       403:
 *         description: Accès refusé — admin uniquement
 */
router.post('/:id/validate-cash', protect, adminOnly, validateCashPayment);

/**
 * @swagger
 * /contracts/{id}/sign:
 *   post:
 *     summary: Signer électroniquement un contrat
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [signature]
 *             properties:
 *               signature:
 *                 type: string
 *                 description: Signature en base64 PNG
 *     responses:
 *       200:
 *         description: Contrat signé avec succès
 */
router.post('/:id/sign', protect, signContract);

/**
 * @swagger
 * /contracts/{id}:
 *   delete:
 *     summary: Supprimer un contrat (admin uniquement)
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contrat supprimé
 *       403:
 *         description: Accès refusé — admin uniquement
 */
router.delete('/:id', protect, adminOnly, deleteContract);

module.exports = router;
