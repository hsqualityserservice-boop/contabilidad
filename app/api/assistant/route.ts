import { generateObject, gateway } from 'ai'
import { z } from 'zod'

const CONFIG_GENEVE = {
  precioHoraTrabajador: 52,
  rendimientoM2PorHora: 20,
  tvaSuiza: 0.081,
  multiplicadores: {
    fin_de_bail: 1.3,
    cabinet: 1.5,
    bureaux: 1,
    vitrines: 1.2,
  },
  productosPorM2: {
    fin_de_bail: 1,
    cabinet: 1.8,
    bureaux: 0.6,
    vitrines: 0.8,
  },
} as const

type Servicio = keyof typeof CONFIG_GENEVE.multiplicadores

const analisisSchema = z.object({
  suciedadExtrema: z.boolean().describe('True si menciona Diógenes, inundación, restos de obra o mucha suciedad'),
  cristalesAdicionales: z.boolean().describe('True si pide limpiar más cristales de lo normal'),
})

const redondear = (value: number) => Math.round(value * 100) / 100

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const servicio = body.servicio as Servicio
    const npa = typeof body.npa === 'string' ? body.npa.trim() : ''
    const metros = Number(body.metros)
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''

    if (!(servicio in CONFIG_GENEVE.multiplicadores)) {
      return Response.json({ success: false, error: 'Selecciona un servicio válido.' }, { status: 400 })
    }
    if (!/^\d{4}$/.test(npa) || Number(npa) < 1000 || Number(npa) > 9999) {
      return Response.json({ success: false, error: 'Introduce un NPA suizo válido.' }, { status: 400 })
    }
    if (!Number.isFinite(metros) || metros <= 0) {
      return Response.json({ success: false, error: 'Introduce una superficie válida.' }, { status: 400 })
    }

    const { object: analisisIA } = await generateObject({
      model: gateway('openai/gpt-4o-mini'),
      schema: analisisSchema,
      prompt: `Analiza la petición del cliente para un servicio de limpieza en Ginebra y detecta extras. Si está vacía, devuelve false en ambos campos: "${prompt}"`,
    })

    let factorComplejidad = CONFIG_GENEVE.multiplicadores[servicio]
    if (analisisIA.suciedadExtrema) factorComplejidad += 0.4
    if (analisisIA.cristalesAdicionales) factorComplejidad += 0.15

    const horasBase = metros / CONFIG_GENEVE.rendimientoM2PorHora
    const horasTotalesTrabajo = Math.ceil(horasBase * factorComplejidad * 10) / 10
    const personalRecomendado = horasTotalesTrabajo > 10 ? 3 : horasTotalesTrabajo > 4 ? 2 : 1
    const horasPorPersona = Math.ceil((horasTotalesTrabajo / personalRecomendado) * 10) / 10
    const manoObra = horasTotalesTrabajo * CONFIG_GENEVE.precioHoraTrabajador
    const productosYMateriales = metros * CONFIG_GENEVE.productosPorM2[servicio]
    const subtotalHT = manoObra + productosYMateriales
    const tvaCalculado = subtotalHT * CONFIG_GENEVE.tvaSuiza
    const totalPresupuestoCHF = subtotalHT + tvaCalculado

    return Response.json({
      success: true,
      desglose: {
        horasTotalesTrabajo,
        personalRecomendado,
        horasPorPersona,
        costes: {
          manoObra: redondear(manoObra),
          productosYMateriales: redondear(productosYMateriales),
          subtotalHT: redondear(subtotalHT),
          tvaCalculado: redondear(tvaCalculado),
          totalPresupuestoCHF: redondear(totalPresupuestoCHF),
        },
      },
    })
  } catch {
    return Response.json({ success: false, error: 'No se pudo generar la cotización. Inténtalo de nuevo.' }, { status: 500 })
  }
}
