const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Tableau de bord administrateur
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Statistiques globales du tableau de bord (admin uniquement)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques agrégées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                   example: 120
 *                 totalContracts:
 *                   type: integer
 *                   example: 85
 *                 activeContracts:
 *                   type: integer
 *                   example: 60
 *                 totalRevenue:
 *                   type: number
 *                   example: 42500
 *                 pendingClaims:
 *                   type: integer
 *                   example: 5
 *       403:
 *         description: Accès refusé — admin uniquement
 */
router.get('/stats', protect, adminOnly, getStats);

module.exports = router;
