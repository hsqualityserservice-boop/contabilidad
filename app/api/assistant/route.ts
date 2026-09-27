import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const CONFIG_NEGOCIO = {
  precioHoraOperario: 25,
  rendimientoM2PorHora: 20,
  multiplicadoresLimpieza: { apartamento: 1, local: 1.2, vitrina: 1.3, cabinet: 1.5, debarras: 1.8 },
  productosPorM2: { apartamento: 0.5, local: 0.8, vitrina: 1, cabinet: 1.5, debarras: 1.2 },
} as const

type TipoEspacio = keyof typeof CONFIG_NEGOCIO.multiplicadoresLimpieza

const datosLimpiezaSchema = z.object({
  tipoEspacio: z.enum(['apartamento', 'local', 'vitrina', 'cabinet', 'debarras']),
  metrosCuadrados: z.number().positive().describe('Metros cuadrados totales del espacio'),
  complejidadExtra: z.boolean().describe('True si hay fin de obra, escaleras o suciedad extrema'),
})

const redondear = (value: number) => Math.round(value * 100) / 100

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
    if (!prompt) return Response.json({ success: false, error: 'Describe el servicio de limpieza.' }, { status: 400 })

    const { object: datos } = await generateObject({
      model: openai('gpt-4o'),
      schema: datosLimpiezaSchema,
      prompt: `Analiza únicamente esta solicitud de limpieza y extrae los datos para cotizarla: "${prompt}"`,
    })

    const tipo = datos.tipoEspacio as TipoEspacio
    const multiplicador = CONFIG_NEGOCIO.multiplicadoresLimpieza[tipo] + (datos.complejidadExtra ? 0.3 : 0)
    const horasTotales = Math.ceil((datos.metrosCuadrados / CONFIG_NEGOCIO.rendimientoM2PorHora) * multiplicador * 10) / 10
    const operariosRecomendados = horasTotales > 12 ? 3 : horasTotales > 5 ? 2 : 1
    const horasPorPersona = Math.ceil((horasTotales / operariosRecomendados) * 10) / 10
    const costeManoObra = horasTotales * CONFIG_NEGOCIO.precioHoraOperario
    const costeProductos = datos.metrosCuadrados * CONFIG_NEGOCIO.productosPorM2[tipo]

    return Response.json({
      success: true,
      datosIA: datos,
      desglose: {
        totalGeneral: redondear(costeManoObra + costeProductos),
        limpieza: {
          horasTotales,
          operariosRecomendados,
          horasPorPersona,
          costeManoObra: redondear(costeManoObra),
          costeProductos: redondear(costeProductos),
        },
      },
    })
  } catch {
    return Response.json({ success: false, error: 'No se pudo generar la cotización. Inténtalo de nuevo.' }, { status: 500 })
  }
}
