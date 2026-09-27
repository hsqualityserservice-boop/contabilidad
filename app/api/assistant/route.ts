import { generateObject } from 'ai'
import { z } from 'zod'

const TARIFAS = {
  precioHoraPersona: 38,
  rendimientoM2PorHora: 20,
  iva: 0.081,
  multiplicadores: {
    apartamento: 1,
    local: 1.2,
    vitrina: 1.3,
    cabinet: 1.5,
    debarras: 1.8,
  },
  productosPorM2: {
    apartamento: 0.5,
    local: 0.8,
    vitrina: 1,
    cabinet: 1.5,
    debarras: 1.2,
  },
} as const

const datosSchema = z.object({
  tipoEspacio: z.enum(['apartamento', 'local', 'vitrina', 'cabinet', 'debarras']),
  metrosCuadrados: z.number().positive(),
  numeroVitrinas: z.number().nonnegative().optional(),
  complejidadExtra: z.boolean(),
})

const redondear = (valor: number) => Math.round(valor * 100) / 100

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
    const language = typeof body.language === 'string' ? body.language : 'FR'

    if (prompt.length < 2) {
      return Response.json({ text: 'Veuillez décrire votre besoin de nettoyage.', error: 'Prompt requis.' }, { status: 400 })
    }

    const { object: datosExtraidos } = await generateObject({
      model: 'anthropic/claude-haiku-4.5',
      schema: datosSchema,
      system: `Tu extrais uniquement les données d'une demande de nettoyage suisse. Réponds aux champs du schéma. Si une donnée manque, estime-la prudemment. Le résultat est destiné à un devis en CHF.`,
      prompt: `Langue de réponse: ${language}. Demande: ${prompt}`,
    })

    const tipo = datosExtraidos.tipoEspacio
    const metrosCalculados = datosExtraidos.metrosCuadrados + (datosExtraidos.numeroVitrinas ?? 0) * 3
    let multiplicador = TARIFAS.multiplicadores[tipo]
    if (datosExtraidos.complejidadExtra) multiplicador += 0.3

    const horasTotalesTrabajo = Math.ceil((metrosCalculados / TARIFAS.rendimientoM2PorHora) * multiplicador * 10) / 10
    const personalRecomendado = horasTotalesTrabajo > 12 ? 3 : horasTotalesTrabajo > 5 ? 2 : 1
    const horasEstimadasPorPersona = Math.ceil((horasTotalesTrabajo / personalRecomendado) * 10) / 10
    const manoObra = horasTotalesTrabajo * TARIFAS.precioHoraPersona
    const productosYMateriales = metrosCalculados * TARIFAS.productosPorM2[tipo]
    const subtotalHT = manoObra + productosYMateriales
    const iva = subtotalHT * TARIFAS.iva
    const totalTTC = subtotalHT + iva

    return Response.json({
      success: true,
      moneda: 'CHF',
      analisisIA: datosExtraidos,
      desglose: {
        metrosCalculados,
        horasTotalesTrabajo,
        organizacionEquipo: { personalRecomendado, horasEstimadasPorPersona },
        costes: {
          manoObra: redondear(manoObra),
          productosYMateriales: redondear(productosYMateriales),
          subtotalHT: redondear(subtotalHT),
          iva: redondear(iva),
          tasaIVA: '8.1%',
          totalTTC: redondear(totalTTC),
          totalPresupuesto: redondear(totalTTC),
        },
      },
    })
  } catch (error) {
    console.error('[v0] Error calculando presupuesto CHF:', error)
    return Response.json({ success: false, error: 'Impossible de calculer le devis pour le moment.' }, { status: 500 })
  }
}
