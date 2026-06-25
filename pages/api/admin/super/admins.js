import bcrypt from 'bcryptjs'
import { getSession } from '../../../../lib/session'
import { getDB } from '../../../../lib/db'

export default async function handler(req, res) {
  const session = await getSession(req, res)
  if (!session.admin || session.admin.role !== 'super_admin') {
    return res.status(403).json({ error: 'Accès réservé au super admin' })
  }

  const sql = getDB()

  // ── GET : tous les admins locaux ──────────────────────────────
  if (req.method === 'GET') {
    try {
      const admins = await sql`
        SELECT a.id, a.username, a.full_name, a.email, a.role, a.is_active, a.created_at,
               c.name AS commune_name, a.commune_id
        FROM admins a
        LEFT JOIN communes c ON a.commune_id = c.id
        WHERE a.role = 'local_admin'
        ORDER BY a.full_name, a.username`
      return res.json(admins)
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  // ── POST : créer un admin local ───────────────────────────────
  if (req.method === 'POST') {
    const { username, full_name, email, password, commune_id } = req.body
    if (!username || !password) return res.status(400).json({ error: 'username et password requis' })
    if (password.length < 6) return res.status(400).json({ error: 'Mot de passe trop court' })
    try {
      const hash = bcrypt.hashSync(password, 10)
      const rows = await sql`
        INSERT INTO admins (username, full_name, email, password_hash, role, commune_id)
        VALUES (${username}, ${full_name||null}, ${email||null}, ${hash}, 'local_admin', ${commune_id||null})
        RETURNING id, username, full_name, email, role, commune_id, is_active, created_at`
      try { await sql`INSERT INTO admin_logs (admin_id, action, details) VALUES (${session.admin.id}, ${'create_admin'}, ${`Admin créé : ${username}`})` } catch {}
      return res.status(201).json(rows[0])
    } catch (e) {
      if (e.message.includes('unique')) return res.status(409).json({ error: 'Ce nom d\'utilisateur est déjà pris' })
      return res.status(500).json({ error: e.message })
    }
  }

  // ── DELETE : désactiver un admin local ───────────────────────
  if (req.method === 'DELETE') {
    const id = parseInt(req.query.id)
    if (!id) return res.status(400).json({ error: 'id manquant' })
    try {
      await sql`UPDATE admins SET is_active = false WHERE id = ${id} AND role = 'local_admin'`
      try { await sql`INSERT INTO admin_logs (admin_id, action, details) VALUES (${session.admin.id}, ${'disable_admin'}, ${`Admin désactivé : id=${id}`})` } catch {}
      return res.json({ ok: true })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(405).end()
}
