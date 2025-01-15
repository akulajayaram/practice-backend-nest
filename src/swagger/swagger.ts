import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { SWAGGER_CONFIG } from './swagger.config';

/**
 * Creates an OpenAPI document for an application, via Swagger.
 * @param app The NestJS application
 * @returns The OpenAPI document
 */
export function createDocument(app: INestApplication): OpenAPIObject {
  const { name, url, email } = SWAGGER_CONFIG.contact;

  // Initialize the DocumentBuilder with basic API details
  const builder = new DocumentBuilder()
    .setTitle(SWAGGER_CONFIG.title)
    .setDescription(SWAGGER_CONFIG.description)
    .setVersion(SWAGGER_CONFIG.version)
    .setContact(name, url, email)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', // Specifies the token format
        description: 'Enter JWT token here', // Optional description for clarity
      },
      'authorization', // Security name for Swagger UI
    );

  // Add tags for better API grouping in Swagger UI
  for (const tag of SWAGGER_CONFIG.tags) {
    builder.addTag(tag);
  }

  // Build the Swagger options
  const options = builder.build();

  // Create and return the Swagger document
  return SwaggerModule.createDocument(app, options);
}
