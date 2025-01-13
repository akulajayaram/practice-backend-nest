import { config } from 'dotenv';
import { resolve } from 'path';
import { getEnvPath } from '../utils/env.helper';

const envFilePath: string = getEnvPath(resolve(__dirname, '../../..', 'env'));

config({ path: envFilePath });

export const configuration = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
  },
  adminUser: {
    email: process.env.ADMIN_EMAIL || 'admin@admin.com',
    password: process.env.ADMIN_PASSWORD || '12345678',
  },
});
