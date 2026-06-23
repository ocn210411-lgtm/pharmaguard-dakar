import { getPharmaciesNearby } from '../../lib/functions'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { nearby, lat, lng, communeId } = req.query
  if (nearby !== '1' || !lat || !lng) return res.status(400).json({ error: 'Paramètres manquants' })
  try {
    const data = await getPharmaciesNearby(parseFloat(lat), parseFloat(lng), 3, communeId ? parseInt(communeId) : null)
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
