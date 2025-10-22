const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OTT Mock API',
      version: '1.0.0',
      description:
        'Mock API for OTT app categories. Poster URLs are dynamically generated based on the current request host. Static images are served from the /images path (e.g., /images/bcs.jpg). In proxied previews (e.g., VS Code HTTPS preview), prefix paths with the proxy base such as /proxy/3001 (e.g., /proxy/3001/images/bcs.jpg).',
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
