import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Direct connection (non-pooled) for migrations and Drizzle Studio
    url: process.env.DATABASE_POSTGRES_URL_NON_POOLING!,
  },
})