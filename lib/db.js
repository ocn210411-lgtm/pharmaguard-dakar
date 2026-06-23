import { neon } from '@neondatabase/serverless'

// Connexion Neon (PostgreSQL serverless — compatible Vercel)
export function getDB() {
  return neon(process.env.DATABASE_URL)
}
