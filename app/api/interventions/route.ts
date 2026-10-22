import { pool } from '@/lib/db'

async function ensureTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS interventions (id SERIAL PRIMARY KEY, email TEXT NOT NULL, date_planifiee DATE NOT NULL, service TEXT NOT NULL, montant_ttc NUMERIC DEFAULT 0, statut TEXT DEFAULT 'planifiée', created_at TIMESTAMPTZ DEFAULT NOW())`)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email ?? '').slice(0, 200)
    const service = String(body.service ?? '').slice(0, 100)
    const date = String(body.date_planifiee ?? '').slice(0, 10)
    const amount = Number(body.montant_ttc)
    const statut = String(body.statut ?? 'devis').slice(0, 30)
    if (!email || !service || !date || !Number.isFinite(amount)) return Response.json({ success: false, error: 'Données invalides.' }, { status: 400 })
    await ensureTable()
    const { rows } = await pool.query('INSERT INTO interventions (email, date_planifiee, service, montant_ttc, statut) VALUES ($1, $2, $3, $4, $5) RETURNING *', [email, date, service, amount, statut])
    return Response.json({ success: true, intervention: rows[0] })
  } catch (error) { console.error('interventions POST', error); return Response.json({ success: false, error: 'Erreur serveur.' }, { status: 500 }) }
}

export async function GET(request: Request) {
  try {
    const email = new URL(request.url).searchParams.get('email') ?? ''
    if (!email) return Response.json({ success: false, error: 'E-mail requis.' }, { status: 400 })
    await ensureTable()
    const { rows } = await pool.query('SELECT * FROM interventions WHERE email = $1 ORDER BY date_planifiee DESC, created_at DESC LIMIT 100', [email])
    return Response.json({ success: true, interventions: rows })
  } catch (error) { console.error('interventions GET', error); return Response.json({ success: false, error: 'Erreur serveur.' }, { status: 500 }) }
}
