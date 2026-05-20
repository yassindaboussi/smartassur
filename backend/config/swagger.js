const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SmartAssur API',
      version: '1.0.0',
      description: 'Documentation de l\'API SmartAssur — Gestion des contrats, sinistres, paiements et utilisateurs.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Serveur local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
            username: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            phone: { type: 'string', example: '+21612345678' },
            address: { type: 'string', example: '10 Rue de la République, Tunis' },
            dateNaissance: { type: 'string', format: 'date', example: '1990-05-15' },
            codePostal: { type: 'string', example: '1000' },
            idType: { type: 'string', enum: ['cin', 'sejour'], example: 'cin' },
            idNumber: { type: 'string', example: '12345678' },
            profileImage: { type: 'string', example: 'uploads/photo.jpg' },
            isEmailVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Contract: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string', description: 'User ID' },
            type: { type: 'string', enum: ['Auto', 'Vie', 'Vol'] },
            numeroContrat: { type: 'string', example: 'AUT00001234567890' },
            status: { type: 'string', enum: ['pending', 'approved', 'active', 'rejected'] },
            dossierSubmitted: { type: 'boolean' },
            price: { type: 'number', example: 450 },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            paymentStatus: { type: 'string', enum: ['unpaid', 'pending_cash', 'paid'] },
            paymentMethod: { type: 'string', enum: ['online', 'cash'], nullable: true },
            clientSignature: { type: 'string', nullable: true, description: 'Base64 PNG signature' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Claim: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            contract: { type: 'string' },
            description: { type: 'string', example: 'Accident de voiture sur l\'autoroute' },
            images: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['en attente', 'en cours', 'approuvé', 'refusé'] },
            adminComment: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Reclamation: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            subject: { type: 'string', example: 'Problème de remboursement' },
            description: { type: 'string' },
            contactPreference: { type: 'string', enum: ['email', 'phone'] },
            contactValue: { type: 'string' },
            status: { type: 'string', enum: ['en attente', 'en cours', 'résolu'] },
            adminResponse: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            contract: { type: 'string' },
            amount: { type: 'number', example: 450 },
            status: { type: 'string', enum: ['en attente', 'payé', 'échoué'] },
            date: { type: 'string', format: 'date-time' },
          },
        },
        News: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string', example: 'Nouvelle offre d\'assurance auto' },
            content: { type: 'string' },
            image: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
