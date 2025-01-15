import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(SeederModule); // Create the NestJS app context
  const seederService = app.get(SeederService); // Get the SeederService instance

  await seederService.runSeeders(); // Call your seeding logic
  await app.close(); // Close the app after seeding
}

bootstrap();
