'use client'

import { useState } from 'react'
import { Calculator, Sparkles, UserCheck } from 'lucide-react'

type QuoteResult = {
  success: boolean
  datosIA: {
    tipoEspacio: string
    metrosCuadrados: number
    complejidadExtra: boolean
  }
  desglose: {
    totalGeneral: number
    limpieza: {
      horasTotales: number
      operariosRecomendados: number
      horasPorPersona: number
      costeManoObra: number
      costeProductos: number
    }
  }
  error?: string
}

const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<QuoteResult | null>(null)
  const [error, setError] = useState('')

  async function procesarCotizacion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })
      const data = (await response.json()) as QuoteResult
      if (!response.ok || !data.success) throw new Error(data.error || 'No se pudo calcular el presupuesto.')
      setResultado(data)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo calcular el presupuesto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-12 pt-6 text-slate-900">
      <div className="mx-auto max-w-md">
        <header className="mb-6 text-center">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600">
            <Sparkles className="h-7 w-7" aria-hidden="true" /> H&S Cleaning
          </h1>
          <p className="mt-1 text-xs text-slate-500">Presupuestos de limpieza claros y rápidos</p>
        </header>

        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm" aria-labelledby="quote-title">
          <h2 id="quote-title" className="mb-2 text-sm font-semibold text-slate-700">Describe el servicio de limpieza</h2>
          <form onSubmit={procesarCotizacion}>
            <label htmlFor="quote-request" className="sr-only">Describe tu servicio de limpieza</label>
            <textarea
              id="quote-request"
              className="h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej.: Limpieza profunda de un apartamento de 80 m², con suciedad extrema y cristales."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !prompt.trim()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-md shadow-blue-200 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
              <Calculator className="h-4 w-4" aria-hidden="true" />
              {loading ? 'Calculando presupuesto…' : 'Calcular presupuesto'}
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
        </section>

        {resultado && (
          <section className="mt-6 space-y-4" aria-live="polite" aria-label="Resultado del presupuesto">
            <div className="rounded-2xl bg-blue-600 p-4 text-center text-white shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Presupuesto estimado</p>
              <p className="mt-1 text-3xl font-black">{currency.format(resultado.desglose.totalGeneral)}</p>
            </div>
            <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 border-b pb-2 text-sm font-bold text-slate-800">
                <Sparkles className="h-4 w-4 text-amber-500" aria-hidden="true" />
                Desglose de limpieza ({resultado.datosIA.tipoEspacio})
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex justify-between"><span>Área a tratar:</span><strong>{resultado.datosIA.metrosCuadrados} m²</strong></li>
                <li className="flex items-center justify-between"><span className="flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" aria-hidden="true" />Personal requerido:</span><strong>{resultado.desglose.limpieza.operariosRecomendados} operario(s)</strong></li>
                <li className="flex justify-between"><span>Tiempo estimado:</span><strong>{resultado.desglose.limpieza.horasPorPersona} h/persona</strong></li>
                <li className="mt-2 flex justify-between border-t pt-2"><span>Mano de obra:</span><strong>{currency.format(resultado.desglose.limpieza.costeManoObra)}</strong></li>
                <li className="flex justify-between"><span>Productos:</span><strong>{currency.format(resultado.desglose.limpieza.costeProductos)}</strong></li>
              </ul>
            </article>
          </section>
        )}
      </div>
    </main>
  )
}
