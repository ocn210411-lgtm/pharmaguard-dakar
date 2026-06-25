import { getSession } from '../../../../lib/session'
import { getDB } from '../../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const session = await getSession(req, res)
  if (!session.admin || session.admin.role !== 'super_admin') {
    return res.status(403).json({ error: 'Accès réservé au super admin' })
  }

  const sql = getDB()
  try {
    const logs = await sql`
      SELECT l.id, l.action, l.details, l.created_at,
             a.username, a.full_name, a.role
      FROM admin_logs l
      JOIN admins a ON l.admin_id = a.id
      ORDER BY l.created_at DESC
      LIMIT 15`
    return res.json(logs)
  } catch (e) {
    // La table peut ne pas exister
    return res.json([])
  }
}
