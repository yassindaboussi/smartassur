const express = require('express');
const router = express.Router();
const { getClaims, getClaimById, createClaim, updateClaim, updateClaimByUser } = require('../controllers/claimController');
const { protect, adminOnly } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

/**
 * @swagger
 * tags:
 *   name: Claims
 *   description: Gestion des sinistres
 */

/**
 * @swagger
 * /claims:
 *   get:
 *     summary: Lister les sinistres (admin = tous, user = les siens)
 *     tags: [Claims]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des sinistres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Claim'
 */
router.get('/', protect, getClaims);

/**
 * @swagger
 * /claims/{id}:
 *   get:
 *     summary: Récupérer un sinistre par ID
 *     tags: [Claims]
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
 *         description: Données du sinistre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Claim'
 *       404:
 *         description: Sinistre non trouvé
 */
router.get('/:id', protect, getClaimById);

/**
 * @swagger
 * /claims:
 *   post:
 *     summary: Déclarer un nouveau sinistre
 *     tags: [Claims]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [contract, description]
 *             properties:
 *               contract:
 *                 type: string
 *                 description: ID du contrat concerné
 *               description:
 *                 type: string
 *                 example: "Accident de voiture sur l'autoroute A1"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Jusqu'à 5 photos du sinistre
 *     responses:
 *       201:
 *         description: Sinistre déclaré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Claim'
 */
router.post('/', protect, upload.array('images', 5), createClaim);

/**
 * @swagger
 * /claims/{id}:
 *   patch:
 *     summary: Modifier un sinistre (par l'utilisateur)
 *     tags: [Claims]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Sinistre mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Claim'
 */
router.patch('/:id', protect, upload.array('images', 5), updateClaimByUser);

/**
 * @swagger
 * /claims/{id}:
 *   put:
 *     summary: Traiter un sinistre (admin uniquement)
 *     tags: [Claims]
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [en attente, en cours, approuvé, refusé]
 *               adminComment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sinistre mis à jour par l'admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Claim'
 *       403:
 *         description: Accès refusé — admin uniquement
 */
router.put('/:id', protect, adminOnly, updateClaim);

module.exports = router;
