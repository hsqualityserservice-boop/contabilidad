import { NextResponse } from 'next/server'

const CONFIG_SUISSE_ROMANDE = {
  tva: 0.081,
  rendementM2ParHeure: 20,
  tarifsParRegion: {
    geneve: { horaire: 52, fraisDeplacement: 0 },
    vaud: { horaire: 46, fraisDeplacement: 0 },
    neuchatel: { horaire: 46, fraisDeplacement: 0 },
    fribourg: { horaire: 45, fraisDeplacement: 0 },
    valais_plaine: { horaire: 45, fraisDeplacement: 15 },
    valais_station: { horaire: 49, fraisDeplacement: 45 },
  },
  multiplicateursService: { fin_de_bail: 1.3, cabinet: 1.5, bureaux: 1, vitrines: 1.2 },
  produitsParM2: { fin_de_bail: 1, cabinet: 1.8, bureaux: 0.6, vitrines: 0.8 },
} as const

type Region = keyof typeof CONFIG_SUISSE_ROMANDE.tarifsParRegion
type Service = keyof typeof CONFIG_SUISSE_ROMANDE.multiplicateursService

function determinerRegionParNpa(value: string | number): Region {
  const npa = Number.parseInt(String(value), 10)
  if (npa >= 1200 && npa <= 1299) return 'geneve'
  if (npa >= 1000 && npa <= 1199) return 'vaud'
  if (npa >= 2000 && npa <= 2499) return 'neuchatel'
  if ((npa >= 1470 && npa <= 1499) || (npa >= 1600 && npa <= 1799)) return 'fribourg'
  if ([1936, 3962, 3963].includes(npa)) return 'valais_station'
  if ((npa >= 1870 && npa <= 1999) || (npa >= 3900 && npa <= 3999)) return 'valais_plaine'
  return 'vaud'
}

const arrondir = (value: number) => Math.round(value * 100) / 100

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const servicio = typeof body.servicio === 'string' ? body.servicio as Service : null
    const metros = Number(body.metros)
    const npa = String(body.npa ?? '').trim()
    const complexiteExtra = body.complexiteExtra === true

    if (!servicio || !(servicio in CONFIG_SUISSE_ROMANDE.multiplicateursService) || !Number.isFinite(metros) || metros <= 0 || !/^\d{4}$/.test(npa)) {
      return NextResponse.json({ success: false, error: 'Données de calcul ou NPA manquants.' }, { status: 400 })
    }

    const region = determinerRegionParNpa(npa)
    const tarif = CONFIG_SUISSE_ROMANDE.tarifsParRegion[region]
    const multiplicateur = CONFIG_SUISSE_ROMANDE.multiplicateursService[servicio] + (complexiteExtra ? 0.4 : 0)
    const heuresTotalesTravail = Math.ceil((metros / CONFIG_SUISSE_ROMANDE.rendementM2ParHeure) * multiplicateur * 10) / 10
    const personnelRecommande = heuresTotalesTravail > 10 ? 3 : heuresTotalesTravail > 4 ? 2 : 1
    const heuresParPersonne = Math.ceil((heuresTotalesTravail / personnelRecommande) * 10) / 10
    const mainOeuvre = heuresTotalesTravail * tarif.horaire
    const produits = metros * CONFIG_SUISSE_ROMANDE.produitsParM2[servicio] + (complexiteExtra ? 40 : 0)
    const sousTotalHT = mainOeuvre + produits + tarif.fraisDeplacement
    const tva = sousTotalHT * CONFIG_SUISSE_ROMANDE.tva
    const total = sousTotalHT + tva

    return NextResponse.json({ success: true, monnaie: 'CHF', region: region.toUpperCase().replace('_', ' '), desglose: { heuresTotalesTravail, personnelRecommande, heuresParPersonne, npaService: npa, couts: { mainOeuvre: arrondir(mainOeuvre), produitsEtMateriaux: arrondir(produits), fraisTransport: tarif.fraisDeplacement, sousTotalHT: arrondir(sousTotalHT), tva: arrondir(tva), tauxTVA: '8.1%', totalTTC: arrondir(total), totalPresupuesto: arrondir(total) } } })
  } catch {
    return NextResponse.json({ success: false, error: 'Impossible de calculer le devis pour le moment.' }, { status: 500 })
  }
}
