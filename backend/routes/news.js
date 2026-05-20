const express = require('express');
const router = express.Router();
const { getNews, getNewsById, createNews, updateNews, deleteNews } = require('../controllers/newsController');
const { protect, adminOnly } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

/**
 * @swagger
 * tags:
 *   name: News
 *   description: Actualités et annonces
 */

/**
 * @swagger
 * /news:
 *   get:
 *     summary: Lister toutes les actualités (public)
 *     tags: [News]
 *     security: []
 *     responses:
 *       200:
 *         description: Liste des actualités
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/News'
 */
router.get('/', getNews);

/**
 * @swagger
 * /news/{id}:
 *   get:
 *     summary: Récupérer une actualité par ID (public)
 *     tags: [News]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Données de l'actualité
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *       404:
 *         description: Actualité non trouvée
 */
router.get('/:id', getNewsById);

/**
 * @swagger
 * /news:
 *   post:
 *     summary: Publier une actualité (admin uniquement)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Nouvelle offre d'assurance auto"
 *               content:
 *                 type: string
 *                 example: "Découvrez notre nouvelle offre..."
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Actualité publiée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *       403:
 *         description: Accès refusé — admin uniquement
 */
router.post('/', protect, adminOnly, upload.single('image'), createNews);

/**
 * @swagger
 * /news/{id}:
 *   put:
 *     summary: Modifier une actualité (admin uniquement)
 *     tags: [News]
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Actualité mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 */
router.put('/:id', protect, adminOnly, upload.single('image'), updateNews);

/**
 * @swagger
 * /news/{id}:
 *   delete:
 *     summary: Supprimer une actualité (admin uniquement)
 *     tags: [News]
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
 *         description: Actualité supprimée
 *       403:
 *         description: Accès refusé — admin uniquement
 */
router.delete('/:id', protect, adminOnly, deleteNews);

module.exports = router;
