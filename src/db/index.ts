import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Pooled connection for app queries (better performance)
const client = postgres(process.env.DATABASE_POSTGRES_URL!)
export const db = drizzle(client, { schema })