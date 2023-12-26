const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API with Swagger',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:4000'
      }
    ]
  },
  apis: ['./services/Admin_Service_Location.js', 
          './services/Admin_Service_User.js',
          './services/Admin_Service_Comment.js'
]
};
const swaggerSpec = swaggerJsdoc(options)

module.exports = { swaggerUI, swaggerSpec };