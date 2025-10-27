const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OTT Mock API',
      version: '1.0.0',
      description:
        'Mock API for OTT app categories. Poster URLs are generated based on the current request host and will always include the fixed proxy segment /proxy/3001 before /images (e.g., https://host/proxy/3001/images/bcs.jpg).',
    },
    tags: [
      { name: 'Health', description: 'Service health check' },
      { name: 'Shows', description: 'OTT categories and listings' },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
