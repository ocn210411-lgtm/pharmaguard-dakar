import { getSession } from '../../../../lib/session'
import { getDB } from '../../../../lib/db'

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default async function handler(req, res) {
  const session = await getSession(req, res)
  if (!session.admin || session.admin.role !== 'super_admin') {
    return res.status(403).json({ error: 'Accès réservé au super admin' })
  }

  const sql = getDB()
  const today = new Date().toISOString().split('T')[0]

  // ── GET : toutes les communes avec stats ──────────────────────
  if (req.method === 'GET') {
    try {
      const communes = await sql`
        SELECT c.id, c.name, c.slug, c.description, c.is_active, c.created_at,
               COUNT(DISTINCT p.id) FILTER (WHERE p.is_active) AS nb_pharmacies,
               COUNT(DISTINCT g.pharmacy_id) AS guards_today
        FROM communes c
        LEFT JOIN pharmacies p ON p.commune_id = c.id
        LEFT JOIN garde g ON g.commune_id = c.id AND g.garde_date = ${today}
        GROUP BY c.id
        ORDER BY c.name`
      return res.json(communes)
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  // ── POST : ajouter une commune ────────────────────────────────
  if (req.method === 'POST') {
    const { name, desc } = req.body
    if (!name) return res.status(400).json({ error: 'Nom requis' })
    const slug = slugify(name)
    try {
      const rows = await sql`
        INSERT INTO communes (name, slug, description) VALUES (${name}, ${slug}, ${desc||null})
        RETURNING id, name, slug`
      // Log
      try { await sql`INSERT INTO admin_logs (admin_id, action, details) VALUES (${session.admin.id}, ${'create_commune'}, ${`Commune créée : ${name}`})` } catch {}
      return res.status(201).json(rows[0])
    } catch (e) {
      if (e.message.includes('unique')) return res.status(409).json({ error: 'Ce nom/slug existe déjà' })
      return res.status(500).json({ error: e.message })
    }
  }

  // ── PUT : activer / désactiver une commune ───────────────────
  if (req.method === 'PUT') {
    const { id, is_active } = req.body
    if (!id) return res.status(400).json({ error: 'id manquant' })
    try {
      await sql`UPDATE communes SET is_active = ${!!is_active} WHERE id = ${parseInt(id)}`
      const action = is_active ? 'enable_commune' : 'disable_commune'
      const label  = is_active ? 'activée' : 'désactivée'
      try { await sql`INSERT INTO admin_logs (admin_id, action, details) VALUES (${session.admin.id}, ${action}, ${`Commune ${label} : id=${id}`})` } catch {}
      return res.json({ ok: true })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  // ── DELETE : désactiver une commune (compat) ──────────────────
  if (req.method === 'DELETE') {
    const id = parseInt(req.query.id)
    if (!id) return res.status(400).json({ error: 'id manquant' })
    try {
      await sql`UPDATE communes SET is_active = false WHERE id = ${id}`
      try { await sql`INSERT INTO admin_logs (admin_id, action, details) VALUES (${session.admin.id}, ${'disable_commune'}, ${`Commune désactivée : id=${id}`})` } catch {}
      return res.json({ ok: true })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(405).end()
}
