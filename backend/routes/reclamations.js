const express = require('express');
const router = express.Router();
const { getReclamations, createReclamation, updateReclamation, updateReclamationByUser, deleteReclamation } = require('../controllers/reclamationController');
const { protect, adminOnly } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

/**
 * @swagger
 * tags:
 *   name: Reclamations
 *   description: Gestion des réclamations clients
 */

/**
 * @swagger
 * /reclamations:
 *   get:
 *     summary: Lister les réclamations (admin = toutes, user = les siennes)
 *     tags: [Reclamations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des réclamations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reclamation'
 */
router.get('/', protect, getReclamations);

/**
 * @swagger
 * /reclamations:
 *   post:
 *     summary: Soumettre une nouvelle réclamation
 *     tags: [Reclamations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject, description]
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "Problème de remboursement"
 *               description:
 *                 type: string
 *                 example: "Je n'ai toujours pas reçu mon remboursement suite au sinistre du 01/01/2025"
 *               contactPreference:
 *                 type: string
 *                 enum: [email, phone]
 *                 example: email
 *               contactValue:
 *                 type: string
 *                 example: "john@example.com"
 *     responses:
 *       201:
 *         description: Réclamation soumise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reclamation'
 */
router.post('/', protect, upload.array('images'), createReclamation);

/**
 * @swagger
 * /reclamations/{id}:
 *   patch:
 *     summary: Modifier une réclamation (par l'utilisateur)
 *     tags: [Reclamations]
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
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               contactPreference:
 *                 type: string
 *                 enum: [email, phone]
 *               contactValue:
 *                 type: string
 *     responses:
 *       200:
 *         description: Réclamation mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reclamation'
 */
router.patch('/:id', protect, upload.array('images'), updateReclamationByUser);

/**
 * @swagger
 * /reclamations/{id}:
 *   put:
 *     summary: Traiter une réclamation (admin uniquement)
 *     tags: [Reclamations]
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
 *                 enum: [en attente, en cours, résolu]
 *               adminResponse:
 *                 type: string
 *                 example: "Votre réclamation a été traitée. Le remboursement sera effectué sous 5 jours."
 *     responses:
 *       200:
 *         description: Réclamation traitée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reclamation'
 *       403:
 *         description: Accès refusé — admin uniquement
 */
router.put('/:id', protect, adminOnly, updateReclamation);

/**
 * @swagger
 * /reclamations/{id}:
 *   delete:
 *     summary: Supprimer une réclamation (admin uniquement)
 *     tags: [Reclamations]
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
 *         description: Réclamation supprimée
 *       403:
 *         description: Accès refusé — admin uniquement
 */
router.delete('/:id', protect, adminOnly, deleteReclamation);

module.exports = router;
