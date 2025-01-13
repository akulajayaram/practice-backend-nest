import { config } from 'dotenv';
import { resolve } from 'path';
import { getEnvPath } from 'src/core/utils/env.helper';
import { DataSourceOptions } from 'typeorm';

const envFilePath: string = getEnvPath(resolve(__dirname, '../..', 'core/env'));
config({ path: envFilePath });
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host:
    process.env.DATABASE_HOST ||
    'database.czk6cc8c8vrb.ap-south-1.rds.amazonaws.com',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  database: process.env.DATABASE_NAME || 'postgres',
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'asdf1234',
  entities: [`dist/**/*.entity.{ts,js}`],
  // migrations: ['dist/database/migration/history/*.js'],
  logger: 'simple-console',
  synchronize: false, // never use TRUE in production!
  logging: true, // for debugging in dev Area only
};
