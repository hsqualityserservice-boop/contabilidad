'use client'

import { useState } from 'react'
import { Calculator, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'

type Cotizacion = {
  horasTotalesTrabajo: number
  personalRecomendado: number
  horasPorPersona: number
  costes: {
    manoObra: number
    productosYMateriales: number
    subtotalHT: number
    tvaCalculado: number
    totalPresupuestoCHF: number
  }
}

const money = new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' })

export default function NettoyageApp() {
  const [servicio, setServicio] = useState('fin_de_bail')
  const [npa, setNpa] = useState('')
  const [metros, setMetros] = useState('')
  const [detalles, setDetalles] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
  const [error, setError] = useState('')

  async function procederAuPaiement() {
    if (!cotizacion) return

    setPaymentLoading(true)
    setError('')
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalCHF: cotizacion.costes.totalPresupuestoCHF,
          servicioNom: servicio,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.url) throw new Error(data.error || 'No se pudo iniciar el pago.')
      window.location.assign(data.url)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo iniciar el pago.')
      setPaymentLoading(false)
    }
  }

  async function calcularPrecio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!/^\d{4}$/.test(npa) || !metros || Number(metros) <= 0) {
      setError('Introduce un NPA suizo de 4 cifras y una superficie válida.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servicio, npa, metros: Number(metros), prompt: detalles }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.error || 'No se pudo calcular el presupuesto.')

      setCotizacion(data.desglose)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo calcular el presupuesto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-6 text-slate-900">
      <div className="mx-auto max-w-md">
        <header className="mb-6 text-center">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-black tracking-tight text-blue-700">
            <Sparkles className="h-6 w-6 fill-amber-400 text-amber-400" aria-hidden="true" /> SwissClean Pro
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500">Nettoyage professionnel & désinfection · Genève</p>
        </header>

        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <ShieldCheck className="h-8 w-8 shrink-0 text-emerald-600" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold text-emerald-800">Conforme CCT & assurance RC 5M CHF</p>
            <p className="text-[10px] text-emerald-700">Tarifs adaptés au salaire minimum du Canton de Genève.</p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm" aria-labelledby="quote-title">
          <h2 id="quote-title" className="sr-only">Calculer un devis</h2>
          <form onSubmit={calcularPrecio} className="space-y-4">
            <div>
              <label htmlFor="service" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">1. Type de service</label>
              <select id="service" value={servicio} onChange={(event) => setServicio(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500">
                <option value="fin_de_bail">Fin de bail · Garantie de restitution</option>
                <option value="cabinet">Cabinet médical / esthétique</option>
                <option value="bureaux">Bureaux & locaux commerciaux</option>
                <option value="vitrines">Vitrines & cristaux</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label htmlFor="npa" className="text-xs font-bold uppercase tracking-wider text-slate-600">2. NPA<input id="npa" inputMode="numeric" maxLength={4} placeholder="1201" value={npa} onChange={(event) => setNpa(event.target.value.replace(/\D/g, ''))} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" required /></label>
              <label htmlFor="metros" className="text-xs font-bold uppercase tracking-wider text-slate-600">3. Surface (m²)<input id="metros" type="number" min="1" placeholder="65" value={metros} onChange={(event) => setMetros(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" required /></label>
            </div>

            <div>
              <label htmlFor="details" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">4. Détails spécifiques · optionnel</label>
              <textarea id="details" placeholder="Ex.: 3 grandes vitrines et traces de peinture..." value={detalles} onChange={(event) => setDetalles(event.target.value)} className="h-20 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-100 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
              <Calculator className="h-4 w-4" aria-hidden="true" />
              {loading ? 'Calcul des tarifs suisses…' : 'Calculer le devis immédiat'}
            </button>
          </form>
          {error && <p className="mt-3 text-center text-xs font-medium text-red-600" role="alert">{error}</p>}
        </section>

        {cotizacion && (
          <section className="mt-6 space-y-4" aria-live="polite" aria-label="Resultado del presupuesto">
            <div className="rounded-2xl bg-blue-700 p-5 text-center text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Total devis estimé · TVA incluse</p>
              <p className="mt-1 text-4xl font-black">{money.format(cotizacion.costes.totalPresupuestoCHF)}</p>
              {servicio === 'fin_de_bail' && <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-blue-400 bg-blue-800/40 px-3 py-1 text-[10px] font-semibold"><CheckCircle2 className="h-3 w-3" /> Garantie de restitution incluse</p>}
            </div>
            <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="mb-3 border-b pb-2 text-xs font-bold uppercase tracking-wider text-slate-700">Analyse du service</h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex justify-between"><span>Effort estimé</span><strong className="text-slate-900">{cotizacion.horasTotalesTrabajo} heures</strong></li>
                <li className="flex justify-between"><span>Spécialistes recommandés</span><strong className="text-slate-900">{cotizacion.personalRecomendado}</strong></li>
                <li className="flex justify-between"><span>Temps sur place</span><strong className="text-slate-900">~ {cotizacion.horasPorPersona} heures</strong></li>
                <li className="mt-2 flex justify-between border-t pt-2.5"><span>Main-d’œuvre HT</span><span>{money.format(cotizacion.costes.manoObra)}</span></li>
                <li className="flex justify-between"><span>Produits et matériel</span><span>{money.format(cotizacion.costes.productosYMateriales)}</span></li>
                <li className="flex justify-between border-t border-dashed pt-2 font-semibold text-slate-500"><span>Sous-total HT</span><span>{money.format(cotizacion.costes.subtotalHT)}</span></li>
                <li className="flex justify-between font-semibold text-slate-500"><span>TVA · 8,1 %</span><span>{money.format(cotizacion.costes.tvaCalculado)}</span></li>
              </ul>
              <button type="button" onClick={procederAuPaiement} disabled={paymentLoading} className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-100 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">{paymentLoading ? 'Redirection vers Stripe…' : 'Réserver maintenant via TWINT'}</button>
            </article>
          </section>
        )}
      </div>
    </main>
  )
}

