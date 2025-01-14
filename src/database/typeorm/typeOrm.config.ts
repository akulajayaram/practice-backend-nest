import { config } from 'dotenv';
import { resolve } from 'path';
import { getEnvPath } from 'src/core/utils/env.helper';
import { DataSourceOptions } from 'typeorm';

const envFilePath: string = getEnvPath(resolve(__dirname, '../../..', 'env'));
config({ path: envFilePath });
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities: [`dist/**/*.entity.{ts,js}`],
  // migrations: ['dist/database/migration/history/*.js'],
  logger: 'simple-console',
  ssl: {
    rejectUnauthorized: false, // Use `true` for stricter validation with a valid CA certificate
  },
  synchronize: false, // never use TRUE in production!
  logging: true, // for debugging in dev Area only
};
