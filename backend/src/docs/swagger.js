import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env.js';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'SkyRun API',
      version: '1.0.0',
      description: 'REST API for the SkyRun running-tracker application.',
    },
    servers: [{ url: env.apiPrefix, description: 'Current server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  // Route files carry the JSDoc @openapi annotations that build the spec.
  apis: ['./src/routes/**/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
