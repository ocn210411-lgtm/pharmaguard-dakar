import { getSession } from '../../../lib/session'
import { getDB } from '../../../lib/db'

export default async function handler(req, res) {
  const session = await getSession(req, res)
  if (!session.admin) return res.status(401).json({ error: 'Non authentifié' })
  const communeId = parseInt(session.admin.communeId)
  const sql = getDB()

  const today = new Date()
  const lastSat = new Date(today)
  while (lastSat.getDay() !== 6) lastSat.setDate(lastSat.getDate() - 1)
  const planEnd = new Date(lastSat); planEnd.setDate(planEnd.getDate() + 27)
  const wsStr = lastSat.toISOString().split('T')[0]
  const weStr = planEnd.toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]

  const gardeRows = await sql`
    SELECT g.id, g.garde_date, g.garde_type, p.id as pid, p.name, p.phone
    FROM garde g JOIN pharmacies p ON p.id = g.pharmacy_id
    WHERE g.commune_id = ${communeId} AND g.garde_date BETWEEN ${wsStr} AND ${weStr}
    ORDER BY g.garde_date, p.name`

  const byDate = {}
  for (const r of gardeRows) {
    if (!byDate[r.garde_date]) byDate[r.garde_date] = { nuit:[], dimanche:[] }
    const key = r.garde_type === 'nuit' ? 'nuit' : 'dimanche'
    if (!byDate[r.garde_date][key].find(x => x.id === r.pid))
      byDate[r.garde_date][key].push({ id: r.pid, name: r.name, phone: r.phone })
  }

  const weeks4 = []
  for (let w = 0; w < 4; w++) {
    const ws = new Date(lastSat); ws.setDate(ws.getDate() + w * 7)
    const we = new Date(ws);       we.setDate(we.getDate() + 6)
    const nuit = [], dimanche = [], seen = { nuit: new Set(), dimanche: new Set() }
    for (let d = 0; d <= 6; d++) {
      const dk = new Date(ws); dk.setDate(dk.getDate() + d)
      const dkStr = dk.toISOString().split('T')[0]
      for (const p of (byDate[dkStr]?.nuit||[])) { if (!seen.nuit.has(p.id)) { nuit.push(p); seen.nuit.add(p.id) } }
      for (const p of (byDate[dkStr]?.dimanche||[])) { if (!seen.dimanche.has(p.id)) { dimanche.push(p); seen.dimanche.add(p.id) } }
    }
    const isCurrent = todayStr >= ws.toISOString().split('T')[0] && todayStr <= we.toISOString().split('T')[0]
    weeks4.push({
      startStr:   ws.toISOString().split('T')[0],
      startLabel: `${ws.getDate()}/${String(ws.getMonth()+1).padStart(2,'0')}`,
      endLabel:   `${we.getDate()}/${String(we.getMonth()+1).padStart(2,'0')}/${we.getFullYear()}`,
      isCurrent, nuit, dimanche,
      days: Array.from({length:7},(_,d)=>{const dk=new Date(ws);dk.setDate(dk.getDate()+d);const s=dk.toISOString().split('T')[0];return{date:s,...(byDate[s]||{nuit:[],dimanche:[]})}})
    })
  }
  res.json(weeks4)
}
