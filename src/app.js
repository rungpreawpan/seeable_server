const express = require('express');
const bodyParser = require('body-parser');
const registerRoutes = require('./routes/register.route');
const loginRoutes = require('./routes/login.route');
const forgetRoutes = require('./routes/forget.route');
const objectDetectionRoutes = require('./routes/objectDetect.route');
const contactDevRoutes = require('./routes/contactDev.route');
const ocrRoutes = require('./routes/ocr.route');
const obstacleWarningRoutes = require('./routes/obstacleWarning.route');
const arMarkersRoutes = require('./routes/arMarkers.route');

// Swagger Setup
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// swagger options set up
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Seeable API',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  req.io = app.get('io');
  next();
});

// Swagger docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API route
app.use('/', registerRoutes);
app.use('/', loginRoutes);
app.use('/', forgetRoutes);
app.use('/', objectDetectionRoutes);
app.use('/', contactDevRoutes);
app.use('/', ocrRoutes);
app.use('/', obstacleWarningRoutes);
app.use('/', arMarkersRoutes);

module.exports = app;
