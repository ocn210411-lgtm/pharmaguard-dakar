import { getSession } from '../../../lib/session'
import { getDB } from '../../../lib/db'

async function requireAdmin(req, res) {
  const session = await getSession(req, res)
  if (!session.admin) { res.status(401).json({ error: 'Non authentifié' }); return null }
  return session.admin
}

function nextSaturday(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  while (d.getDay() !== 6) d.setDate(d.getDate() + 1)
  return d
}

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res)
  if (!admin) return
  const communeId = parseInt(admin.communeId)
  if (!communeId) return res.status(403).json({ error: 'Aucune commune assignée' })
  const sql = getDB()

  // POST — planifier une semaine
  if (req.method === 'POST') {
    const { week_start, garde_type, pharm_ids } = req.body
    if (!week_start || !garde_type || !pharm_ids?.length)
      return res.status(400).json({ error: 'Paramètres manquants' })
    if (!['nuit','dimanche'].includes(garde_type))
      return res.status(400).json({ error: 'Type invalide' })

    const ws = nextSaturday(week_start)

    // Vérifier que les pharmacies appartiennent à la commune
    const valid = await sql`SELECT id FROM pharmacies WHERE commune_id=${communeId} AND is_active=true`
    const validIds = valid.map(r => r.id.toString())
    const safeIds  = pharm_ids.map(String).filter(id => validIds.includes(id)).map(Number)
    if (!safeIds.length) return res.status(400).json({ error: 'Aucune pharmacie valide' })

    for (const pid of safeIds) {
      if (garde_type === 'nuit') {
        for (let d = 0; d < 7; d++) {
          const date = new Date(ws)
          date.setDate(date.getDate() + d)
          const dateStr = date.toISOString().split('T')[0]
          await sql`INSERT INTO garde (pharmacy_id, commune_id, garde_date, garde_type)
                    VALUES (${pid}, ${communeId}, ${dateStr}, 'nuit')
                    ON CONFLICT DO NOTHING`
        }
      } else {
        const sunday = new Date(ws)
        sunday.setDate(sunday.getDate() + 1)
        const dateStr = sunday.toISOString().split('T')[0]
        await sql`INSERT INTO garde (pharmacy_id, commune_id, garde_date, garde_type)
                  VALUES (${pid}, ${communeId}, ${dateStr}, 'dimanche')
                  ON CONFLICT DO NOTHING`
      }
    }
    return res.json({ ok: true })
  }

  // DELETE — supprimer semaine ou garde individuelle
  if (req.method === 'DELETE') {
    const { week_start, week_type, garde_id } = req.query

    if (garde_id) {
      await sql`DELETE FROM garde WHERE id=${parseInt(garde_id)} AND commune_id=${communeId}`
      return res.json({ ok: true })
    }

    if (week_start && week_type && ['nuit','dimanche'].includes(week_type)) {
      const ws = nextSaturday(week_start)
      const we = new Date(ws); we.setDate(we.getDate() + 6)
      const wsStr = ws.toISOString().split('T')[0]
      const weStr = we.toISOString().split('T')[0]
      await sql`DELETE FROM garde WHERE commune_id=${communeId} AND garde_type=${week_type}
                AND garde_date BETWEEN ${wsStr} AND ${weStr}`
      return res.json({ ok: true })
    }

    return res.status(400).json({ error: 'Paramètres manquants' })
  }

  res.status(405).end()
}
