import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const CONFIG_NEGOCIO = {
  precioHoraOperario: 25,
  rendimientoM2PorHora: 20,
  precioPorKm: 1.5,
  tarifaBaseMudanza: 50,
  precioM3Mudanza: 15,
  multiplicadoresLimpieza: {
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

type TipoEspacio = keyof typeof CONFIG_NEGOCIO.multiplicadoresLimpieza

const datosExtraidosSchema = z.object({
  requiereMudanza: z.boolean(),
  requiereLimpieza: z.boolean(),
  tipoEspacio: z.enum(['apartamento', 'local', 'vitrina', 'cabinet', 'debarras']),
  metrosCuadrados: z.number().min(0).default(0),
  volumenEstimadoM3: z.number().min(0).optional(),
  distanciaEstimadaKm: z.number().min(0).optional(),
  complejidadExtra: z.boolean(),
})

const redondear = (value: number) => Math.round(value * 100) / 100

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : typeof body.message === 'string' ? body.message.trim() : ''

    if (!prompt) {
      return Response.json({ success: false, error: 'Describe el servicio que necesitas.' }, { status: 400 })
    }

    const { object: datos } = await generateObject({
      model: openai('gpt-4o'),
      schema: datosExtraidosSchema,
      prompt: `Analiza esta solicitud de limpieza, mudanza o desescombro y extrae solo los datos necesarios para cotizarla: "${prompt}"`,
    })

    let limpieza: Record<string, number> | null = null
    let mudanza: Record<string, number> | null = null
    let totalGeneral = 0

    if (datos.requiereLimpieza) {
      if (datos.metrosCuadrados <= 0) {
        return Response.json({ success: false, error: 'Indica los metros cuadrados para calcular la limpieza.' }, { status: 400 })
      }

      const multiplicador = CONFIG_NEGOCIO.multiplicadoresLimpieza[datos.tipoEspacio as TipoEspacio] + (datos.complejidadExtra ? 0.3 : 0)
      const horasTotales = Math.ceil((datos.metrosCuadrados / CONFIG_NEGOCIO.rendimientoM2PorHora) * multiplicador * 10) / 10
      const operariosRecomendados = horasTotales > 12 ? 3 : horasTotales > 5 ? 2 : 1
      const horasPorPersona = Math.ceil((horasTotales / operariosRecomendados) * 10) / 10
      const costeManoObra = horasTotales * CONFIG_NEGOCIO.precioHoraOperario
      const costeProductos = datos.metrosCuadrados * CONFIG_NEGOCIO.productosPorM2[datos.tipoEspacio as TipoEspacio]
      const subtotal = costeManoObra + costeProductos

      limpieza = { horasTotales, operariosRecomendados, horasPorPersona, costeManoObra: redondear(costeManoObra), costeProductos: redondear(costeProductos), subtotal: redondear(subtotal) }
      totalGeneral += subtotal
    }

    if (datos.requiereMudanza) {
      const volumenCalculadoM3 = datos.volumenEstimadoM3 ?? 5
      const distanciaCalculadaKm = datos.distanciaEstimadaKm ?? 10
      const costeVolumen = volumenCalculadoM3 * CONFIG_NEGOCIO.precioM3Mudanza
      const costeTrayecto = distanciaCalculadaKm * CONFIG_NEGOCIO.precioPorKm
      const extraDificultad = datos.complejidadExtra ? 40 : 0
      const subtotal = CONFIG_NEGOCIO.tarifaBaseMudanza + costeVolumen + costeTrayecto + extraDificultad

      mudanza = { volumenCalculadoM3, distanciaCalculadaKm, costeBase: CONFIG_NEGOCIO.tarifaBaseMudanza, costeVolumen: redondear(costeVolumen), costeTrayecto: redondear(costeTrayecto), extraDificultad, subtotal: redondear(subtotal) }
      totalGeneral += subtotal
    }

    return Response.json({ success: true, datosIA: datos, desglose: { limpieza, mudanza, totalGeneral: redondear(totalGeneral) } })
  } catch {
    return Response.json({ success: false, error: 'No se pudo generar la cotización. Inténtalo de nuevo.' }, { status: 500 })
  }
}
