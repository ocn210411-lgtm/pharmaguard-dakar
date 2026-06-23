import { getDB } from './db'

// ─── Toutes les communes actives ─────────────────────────────
export async function getAllCommunes() {
  const sql = getDB()
  return sql`SELECT id, name, slug FROM communes WHERE is_active = true ORDER BY name ASC`
}

// ─── Une commune par slug ─────────────────────────────────────
export async function getCommuneBySlug(slug) {
  const sql = getDB()
  const rows = await sql`SELECT * FROM communes WHERE slug = ${slug} AND is_active = true LIMIT 1`
  return rows[0] || null
}

// ─── Pharmacies en garde aujourd'hui ─────────────────────────
export async function getGuardsToday(communeId = null, type = 'nuit') {
  const sql = getDB()
  const today = new Date().toISOString().split('T')[0]

  if (communeId && type) {
    return sql`
      SELECT p.id, p.name, p.doctor, p.address, p.phone, p.latitude, p.longitude,
             g.garde_type, c.name AS commune_name, c.slug AS commune_slug
      FROM garde g
      JOIN pharmacies p ON g.pharmacy_id = p.id
      JOIN communes c   ON p.commune_id  = c.id
      WHERE g.garde_date = ${today} AND p.is_active = true
        AND g.commune_id = ${communeId} AND g.garde_type = ${type}
      ORDER BY c.name, p.name`
  }
  if (communeId) {
    return sql`
      SELECT p.id, p.name, p.doctor, p.address, p.phone, p.latitude, p.longitude,
             g.garde_type, c.name AS commune_name, c.slug AS commune_slug
      FROM garde g
      JOIN pharmacies p ON g.pharmacy_id = p.id
      JOIN communes c   ON p.commune_id  = c.id
      WHERE g.garde_date = ${today} AND p.is_active = true AND g.commune_id = ${communeId}
      ORDER BY c.name, p.name`
  }
  return sql`
    SELECT p.id, p.name, p.doctor, p.address, p.phone, p.latitude, p.longitude,
           g.garde_type, c.name AS commune_name, c.slug AS commune_slug
    FROM garde g
    JOIN pharmacies p ON g.pharmacy_id = p.id
    JOIN communes c   ON p.commune_id  = c.id
    WHERE g.garde_date = ${today} AND p.is_active = true
    ORDER BY c.name, p.name`
}

// ─── Gardes sur une plage de dates ───────────────────────────
export async function getGuardsByDateRange(from, to, communeId = null, type = null) {
  const sql = getDB()
  let rows

  if (communeId && type) {
    rows = await sql`
      SELECT g.id AS garde_id, g.garde_date::text AS garde_date, g.garde_type,
             p.id, p.name, p.doctor, p.address, p.phone, p.latitude, p.longitude,
             c.name AS commune_name, c.slug AS commune_slug
      FROM garde g
      JOIN pharmacies p ON g.pharmacy_id = p.id
      JOIN communes c   ON p.commune_id  = c.id
      WHERE g.garde_date BETWEEN ${from} AND ${to} AND p.is_active = true
        AND g.commune_id = ${communeId} AND g.garde_type = ${type}
      ORDER BY g.garde_date, g.garde_type, p.name`
  } else if (communeId) {
    rows = await sql`
      SELECT g.id AS garde_id, g.garde_date::text AS garde_date, g.garde_type,
             p.id, p.name, p.doctor, p.address, p.phone, p.latitude, p.longitude,
             c.name AS commune_name, c.slug AS commune_slug
      FROM garde g
      JOIN pharmacies p ON g.pharmacy_id = p.id
      JOIN communes c   ON p.commune_id  = c.id
      WHERE g.garde_date BETWEEN ${from} AND ${to} AND p.is_active = true
        AND g.commune_id = ${communeId}
      ORDER BY g.garde_date, g.garde_type, p.name`
  } else {
    rows = await sql`
      SELECT g.id AS garde_id, g.garde_date::text AS garde_date, g.garde_type,
             p.id, p.name, p.doctor, p.address, p.phone, p.latitude, p.longitude,
             c.name AS commune_name, c.slug AS commune_slug
      FROM garde g
      JOIN pharmacies p ON g.pharmacy_id = p.id
      JOIN communes c   ON p.commune_id  = c.id
      WHERE g.garde_date BETWEEN ${from} AND ${to} AND p.is_active = true
      ORDER BY g.garde_date, g.garde_type, p.name`
  }

  // Grouper par date puis par type (même structure que le PHP)
  const result = {}
  for (const row of rows) {
    const d = row.garde_date
    const t = row.garde_type
    if (!result[d]) result[d] = {}
    if (!result[d][t]) result[d][t] = []
    result[d][t].push(row)
  }
  return result
}

// ─── Gardes de la semaine (Sam→Ven) ──────────────────────────
export async function getWeekGuards(communeId, date = null) {
  const ref = date ? new Date(date) : new Date()
  const dow = ref.getDay() // 0=dim, 6=sam

  // Reculer jusqu'au samedi
  const weekStart = new Date(ref)
  const daysBack = dow === 6 ? 0 : (dow + 1) % 7
  weekStart.setDate(weekStart.getDate() - daysBack)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const fmt = d => d.toISOString().split('T')[0]
  const guards = await getGuardsByDateRange(fmt(weekStart), fmt(weekEnd), communeId)

  const nuit = [], dimanche = [], nuitIds = new Set(), dimIds = new Set()
  for (const dateGuards of Object.values(guards)) {
    for (const [type, pharms] of Object.entries(dateGuards)) {
      for (const p of pharms) {
        if (type === 'nuit' && !nuitIds.has(p.id))     { nuit.push(p);     nuitIds.add(p.id) }
        if (type === 'dimanche' && !dimIds.has(p.id))  { dimanche.push(p); dimIds.add(p.id)  }
      }
    }
  }
  return { weekStart, weekEnd, nuit, dimanche }
}

// ─── Toutes les pharmacies d'une commune ─────────────────────
export async function getPharmaciesByCommune(communeId) {
  const sql = getDB()
  return sql`
    SELECT id, name, doctor, address, phone, latitude, longitude, is_active
    FROM pharmacies WHERE commune_id = ${communeId} ORDER BY name ASC`
}

// ─── Pharmacies proches (Haversine) ─────────────────────────
export async function getPharmaciesNearby(lat, lng, radiusKm = 3, communeId = null) {
  const sql = getDB()
  if (communeId) {
    return sql`
      SELECT p.id, p.name, p.address, p.phone, p.latitude, p.longitude,
             c.name AS commune_name, c.slug AS commune_slug,
             (6371 * ACOS(
               COS(RADIANS(${lat})) * COS(RADIANS(p.latitude::float))
               * COS(RADIANS(p.longitude::float) - RADIANS(${lng}))
               + SIN(RADIANS(${lat})) * SIN(RADIANS(p.latitude::float))
             )) AS distance_km
      FROM pharmacies p JOIN communes c ON p.commune_id = c.id
      WHERE p.is_active = true AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
        AND p.commune_id = ${communeId}
      HAVING (6371 * ACOS(
               COS(RADIANS(${lat})) * COS(RADIANS(p.latitude::float))
               * COS(RADIANS(p.longitude::float) - RADIANS(${lng}))
               + SIN(RADIANS(${lat})) * SIN(RADIANS(p.latitude::float))
             )) <= ${radiusKm}
      ORDER BY distance_km LIMIT 10`
  }
  return sql`
    SELECT p.id, p.name, p.address, p.phone, p.latitude, p.longitude,
           c.name AS commune_name, c.slug AS commune_slug,
           (6371 * ACOS(
             COS(RADIANS(${lat})) * COS(RADIANS(p.latitude::float))
             * COS(RADIANS(p.longitude::float) - RADIANS(${lng}))
             + SIN(RADIANS(${lat})) * SIN(RADIANS(p.latitude::float))
           )) AS distance_km
    FROM pharmacies p JOIN communes c ON p.commune_id = c.id
    WHERE p.is_active = true AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
    HAVING (6371 * ACOS(
             COS(RADIANS(${lat})) * COS(RADIANS(p.latitude::float))
             * COS(RADIANS(p.longitude::float) - RADIANS(${lng}))
             + SIN(RADIANS(${lat})) * SIN(RADIANS(p.latitude::float))
           )) <= ${radiusKm}
    ORDER BY distance_km LIMIT 10`
}

// ─── Stats globales ──────────────────────────────────────────
export async function getGlobalStats() {
  const sql = getDB()
  const today = new Date().toISOString().split('T')[0]
  const [communes, pharmacies, guards] = await Promise.all([
    sql`SELECT COUNT(*) AS n FROM communes WHERE is_active = true`,
    sql`SELECT COUNT(*) AS n FROM pharmacies WHERE is_active = true`,
    sql`SELECT COUNT(*) AS n FROM garde WHERE garde_date = ${today}`,
  ])
  return {
    total_communes:   parseInt(communes[0].n),
    total_pharmacies: parseInt(pharmacies[0].n),
    guards_today:     parseInt(guards[0].n),
  }
}

// ─── Auth ────────────────────────────────────────────────────
export async function getAdminByUsername(username) {
  const sql = getDB()
  const rows = await sql`SELECT * FROM admins WHERE username = ${username} LIMIT 1`
  return rows[0] || null
}

export async function canManageCommune(admin, communeId) {
  if (admin.role === 'super_admin') return true
  return admin.commune_id === communeId
}
