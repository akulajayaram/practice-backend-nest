import { SwaggerConfig } from './swagger.interface';

/**
 * Configuration for the swagger UI (found at /api).
 * Change this to suit your app!
 */
export const SWAGGER_CONFIG: SwaggerConfig = {
  title: 'E-commerce API',
  description: 'API documentation for the E-commerce platform.',
  version: '1.0.0',
  contact: {
    name: 'Tech Support',
    url: 'https://ecommerce.com/support',
    email: 'support@ecommerce.com',
  },
  tags: ['Auth', 'User', 'Products'],
};
