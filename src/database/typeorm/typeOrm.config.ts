import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

const configService = new ConfigService();
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT'),
  database: configService.get<string>('DATABASE_NAME'),
  username: configService.get<string>('DATABASE_USER'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  entities: ['dist/**/*.entity.{ts,js}'],
  ssl: {
    rejectUnauthorized: false, // Adjust based on your environment
  },
  synchronize: true, // Never use true in production
  logging: true, // Enable only in development
};
