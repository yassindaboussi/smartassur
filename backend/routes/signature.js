const express = require('express');
const router  = express.Router();
const { getAdminSignature, uploadAdminSignature } = require('../controllers/signatureController');
const { protect, adminOnly } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

/**
 * @swagger
 * tags:
 *   name: Signature
 *   description: Signature administrative pour génération de PDF
 */

/**
 * @swagger
 * /signature/admin:
 *   get:
 *     summary: Récupérer la signature de l'administrateur
 *     tags: [Signature]
 *     security:
 *       - bearerAuth: []
 *     description: Utilisé pour intégrer la signature admin dans les PDF de contrats.
 *     responses:
 *       200:
 *         description: URL de la signature
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "uploads/signature_admin.png"
 *       404:
 *         description: Aucune signature enregistrée
 */
router.get('/admin', protect, getAdminSignature);

/**
 * @swagger
 * /signature/admin:
 *   post:
 *     summary: Uploader ou remplacer la signature de l'administrateur (admin uniquement)
 *     tags: [Signature]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image PNG ou JPEG de la signature
 *     responses:
 *       200:
 *         description: Signature uploadée avec succès
 *       403:
 *         description: Accès refusé — admin uniquement
 */
router.post('/admin', protect, adminOnly, upload.single('file'), uploadAdminSignature);

module.exports = router;
