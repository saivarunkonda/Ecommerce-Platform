const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Service API',
      version: '1.0.0',
      description: 'User management and authentication service for e-commerce platform',
      contact: {
        name: 'API Support',
        email: 'support@ecommerce.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8081',
        description: 'Development server'
      },
      {
        url: 'https://api.ecommerce.com/users',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Unique username',
              example: 'john_doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com'
            },
            firstName: {
              type: 'string',
              description: 'First name',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'Last name',
              example: 'Doe'
            },
            phone: {
              type: 'string',
              description: 'Phone number',
              example: '+1234567890'
            },
            address: {
              type: 'string',
              description: 'User address',
              example: '123 Main St, City, Country'
            },
            role: {
              type: 'string',
              enum: ['customer', 'admin', 'vendor'],
              description: 'User role',
              example: 'customer'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the user is active',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        AuthRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password',
              example: 'securePassword123'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT authentication token'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            expiresIn: {
              type: 'integer',
              description: 'Token expiration time in seconds',
              example: 3600
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type'
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'object',
              description: 'Additional error details'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
