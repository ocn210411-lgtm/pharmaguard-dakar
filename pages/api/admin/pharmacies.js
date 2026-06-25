import { getSession } from '../../../lib/session'
import { getDB } from '../../../lib/db'

async function requireAdmin(req, res) {
  const session = await getSession(req, res)
  if (!session.admin) { res.status(401).json({ error: 'Non authentifié' }); return null }
  return session.admin
}

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res)
  if (!admin) return
  const communeId = parseInt(admin.communeId)
  if (!communeId) return res.status(403).json({ error: 'Aucune commune assignée' })
  const sql = getDB()

  // GET — liste
  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM pharmacies WHERE commune_id = ${communeId} ORDER BY name`
    return res.json(rows)
  }

  // POST — ajouter
  if (req.method === 'POST') {
    const { name, address, phone, lat, lng } = req.body
    if (!name) return res.status(400).json({ error: 'Nom requis' })
    await sql`INSERT INTO pharmacies (commune_id, name, address, phone, latitude, longitude)
              VALUES (${communeId}, ${name}, ${address||null}, ${phone||null}, ${lat||null}, ${lng||null})`
    return res.json({ ok: true })
  }

  // PUT — modifier
  if (req.method === 'PUT') {
    const { id, name, doctor, address, phone, lat, lng, is_active } = req.body
    if (!id || !name) return res.status(400).json({ error: 'id et nom requis' })
    await sql`UPDATE pharmacies SET name=${name}, doctor=${doctor||null}, address=${address||null},
              phone=${phone||null}, latitude=${lat||null}, longitude=${lng||null}, is_active=${is_active ? true : false}
              WHERE id=${parseInt(id)} AND commune_id=${communeId}`
    return res.json({ ok: true })
  }

  // DELETE — supprimer
  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'id requis' })
    await sql`DELETE FROM pharmacies WHERE id=${parseInt(id)} AND commune_id=${communeId}`
    return res.json({ ok: true })
  }

  res.status(405).end()
}
