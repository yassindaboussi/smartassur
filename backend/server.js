require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

connectDB();

const app = express();
app.use(cors());

// ⚠️ Stripe webhook needs RAW body — must be BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'SmartAssur API Docs',
  customCss: '.swagger-ui .topbar { background-color: #1a3c5e; }',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reclamations', require('./routes/reclamations'));
app.use('/api/news', require('./routes/news'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/signature', require('./routes/signature'));

app.get('/', (req, res) => res.json({ message: 'SmartAssur API is running' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});
