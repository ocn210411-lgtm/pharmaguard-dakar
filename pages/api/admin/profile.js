import bcrypt from 'bcryptjs'
import { getSession } from '../../../lib/session'
import { getDB } from '../../../lib/db'

export default async function handler(req, res) {
  const session = await getSession(req, res)
  if (!session.admin) return res.status(401).json({ error: 'Non authentifié' })

  const adminId = session.admin.id
  const sql = getDB()

  // ── GET : profil ─────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT a.id, a.username, a.full_name, a.email, a.role, a.is_active, a.created_at,
               c.name AS commune_name
        FROM admins a
        LEFT JOIN communes c ON a.commune_id = c.id
        WHERE a.id = ${adminId} LIMIT 1`
      if (!rows[0]) return res.status(404).json({ error: 'Admin introuvable' })
      return res.json(rows[0])
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  // ── PUT : modifier infos ──────────────────────────────────────
  if (req.method === 'PUT') {
    const { full_name, username, email } = req.body
    if (!username) return res.status(400).json({ error: 'Nom d\'utilisateur requis' })
    try {
      // Vérifier que le username n'est pas pris par un autre
      const check = await sql`SELECT id FROM admins WHERE username = ${username} AND id != ${adminId} LIMIT 1`
      if (check.length) return res.status(409).json({ error: 'Ce nom d\'utilisateur est déjà utilisé' })

      await sql`UPDATE admins SET full_name=${full_name||null}, username=${username}, email=${email||null} WHERE id=${adminId}`
      // Mettre à jour la session
      session.admin.full_name = full_name || session.admin.full_name
      session.admin.username  = username
      await session.save()
      return res.json({ ok: true })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  // ── POST : changer mot de passe ───────────────────────────────
  if (req.method === 'POST') {
    const { pw_current, pw_new } = req.body
    if (!pw_current || !pw_new) return res.status(400).json({ error: 'Champs manquants' })
    if (pw_new.length < 6) return res.status(400).json({ error: 'Mot de passe trop court (min 6 caractères)' })
    try {
      const rows = await sql`SELECT password_hash FROM admins WHERE id=${adminId} LIMIT 1`
      if (!rows[0]) return res.status(404).json({ error: 'Admin introuvable' })
      const valid = bcrypt.compareSync(pw_current, rows[0].password_hash)
      if (!valid) return res.status(401).json({ error: 'Mot de passe actuel incorrect' })
      const hash = bcrypt.hashSync(pw_new, 10)
      await sql`UPDATE admins SET password_hash=${hash} WHERE id=${adminId}`
      return res.json({ ok: true })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(405).end()
}
