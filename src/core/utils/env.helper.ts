import { existsSync } from 'fs';
import { resolve } from 'path';

export function getEnvPath(dest: string): string {
  const env: string | undefined = process.env.NODE_ENV;
  const fallback: string = resolve(`${dest}/.env`);
  const filename: string = env ? `${env}.env` : 'development.env';
  let filePath: string = resolve(`${dest}/${filename}`);
  if (!existsSync(filePath)) {
    filePath = fallback;
  }

  return filePath;
}

export function determineEnvFilePath(): string {
  const envPath = process.env.ENV_PATH; // Custom path for .env file ( for aws ec2 deployment case)
  if (envPath) {
    console.log(`Using custom environment file path: ${envPath}`);
    return envPath;
  }

  const env = process.env.NODE_ENV || 'development';
  switch (env) {
    case 'production':
      return 'env/.env.prod';
    case 'test':
      return 'env/.env.test';
    default:
      return 'env/.env.dev';
  }
}
