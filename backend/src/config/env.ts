import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_URL: z.url().default('http://localhost:4200'),
  DATABASE_PATH: z.string().min(1).default('./data/tasks.db'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  throw new Error(`Configuración inválida: ${z.prettifyError(result.error)}`);
}

export const env = result.data;
