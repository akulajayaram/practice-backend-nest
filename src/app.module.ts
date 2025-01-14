import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm/typeorm.service';
import { ApiModule } from './app/api.module';
import { determineEnvFilePath } from './core/utils/env.helper';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: determineEnvFilePath(),
      load: [() => ({ environment: process.env.NODE_ENV || 'development' })], // Dynamically add environment configuration
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    ApiModule,
  ],
})
export class AppModule {}
