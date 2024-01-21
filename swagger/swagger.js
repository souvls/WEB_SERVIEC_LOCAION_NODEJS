const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quy Nhơn Travel API',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:4000'
      }
    ],
    securityDefinitions: {
      BearerAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'Enter Bearer token in the format "Bearer <token>"',
      },
    },
  },
  apis: ['./services/Admin_Service_Location.js', 
          './services/Admin_Service_User.js',
          './services/Admin_Service_Comment.js',
          './services/For_User.js', 
          './services/Authentication.js',
  ]
};
const swaggerSpec = swaggerJsdoc(options)

module.exports = { swaggerUI, swaggerSpec };