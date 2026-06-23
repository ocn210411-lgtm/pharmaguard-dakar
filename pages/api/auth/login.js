import bcrypt from 'bcryptjs'
import { getAdminByUsername } from '../../../lib/functions'
import { getSession } from '../../../lib/session'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Champs manquants' })

  try {
    const admin = await getAdminByUsername(username)
    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return res.status(401).json({ error: 'Identifiants incorrects' })
    }
    const session = await getSession(req, res)
    session.admin = {
      id:        admin.id,
      username:  admin.username,
      full_name: admin.full_name,
      role:      admin.role,
      communeId: admin.commune_id,
    }
    await session.save()
    res.json({ ok: true, role: admin.role, communeId: admin.commune_id })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
