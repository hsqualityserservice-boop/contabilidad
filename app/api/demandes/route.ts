import { pool } from '@/lib/db'

// Crée la table automatiquement au premier appel — aucune migration nécessaire
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS demandes (
      id SERIAL PRIMARY KEY,
      nom TEXT DEFAULT '',
      email TEXT DEFAULT '',
      service TEXT NOT NULL,
      npa TEXT DEFAULT '',
      surface NUMERIC DEFAULT 0,
      details TEXT DEFAULT '',
      devis_ttc NUMERIC DEFAULT 0,
      statut TEXT DEFAULT 'recu',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const nom = String(body.nom ?? '').slice(0, 200)
    const email = String(body.email ?? '').slice(0, 200)
    const service = String(body.service ?? '').slice(0, 100)
    const npa = String(body.npa ?? '').slice(0, 4)
    const surface = Number(body.surface) || 0
    const details = String(body.details ?? '').slice(0, 2000)
    const devisTtc = Number(body.devis_ttc) || 0

    if (!service) return Response.json({ success: false, error: 'Service requis.' }, { status: 400 })
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return Response.json({ success: false, error: 'E-mail invalide.' }, { status: 400 })
    }

    await ensureTable()
    const { rows } = await pool.query(
      `INSERT INTO demandes (nom, email, service, npa, surface, details, devis_ttc)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at`,
      [nom, email, service, npa, surface, details, devisTtc],
    )
    return Response.json({ success: true, id: rows[0].id })
  } catch (error) {
    console.error('demandes POST', error)
    return Response.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    await ensureTable()
    const email = new URL(request.url).searchParams.get('email') ?? ''
    const { rows } = email
      ? await pool.query('SELECT * FROM demandes WHERE email = $1 ORDER BY created_at DESC LIMIT 50', [email])
      : await pool.query('SELECT * FROM demandes ORDER BY created_at DESC LIMIT 50')
    return Response.json({ success: true, demandes: rows })
  } catch (error) {
    console.error('demandes GET', error)
    return Response.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
  }
}
