// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Documentation',
      version: '1.0.0',
      description: 'API documentation for your Node + Sequelize backend',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Server',
      },
      {
        url: 'https://your-live-domain.com', 
        description: 'Production Server',
      },
    ],

    // Add JWT security definition
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer <token>',
        },
      },
    },

    // Apply global security if needed (so all routes require JWT unless overridden)
    security: [
      {
        BearerAuth: [],
      },
    ],
  },

  //  Point to route & swagger files
  apis: [
    path.join(__dirname, '/routes/*.js'),
    path.join(__dirname, '/swagger/*.js'),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

function swaggerDocs(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(` Swagger Docs available at:
  👉 Local: http://localhost:3000/api-docs
  👉 Live:  https://your-live-domain.com/api-docs`);
}

module.exports = swaggerDocs;
