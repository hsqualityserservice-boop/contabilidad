'use client'

import { useState } from 'react'
import { CalendarDays, Check, Clock3, MessageSquareText, Send } from 'lucide-react'
import type { ClientCopy, Lang } from '@/lib/i18n'

export function ClientWorkspace({ lang, t, onNotice }: { lang: Lang; t: ClientCopy; onNotice: (message: string) => void }) {
  const [details, setDetails] = useState('')
  const [day, setDay] = useState('')
  const [slot, setSlot] = useState('')
  const [reminder, setReminder] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [proposal, setProposal] = useState('')
  const [asking, setAsking] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [presenceConfirmed, setPresenceConfirmed] = useState(false)
  const estimatedNet = 2480
  const vatAmount = estimatedNet * 0.081
  const estimatedTotal = estimatedNet + vatAmount

  async function askAssistant() {
    if (!prompt.trim()) return
    setAsking(true)
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json', 'x-language': lang }, body: JSON.stringify({ message: prompt, language: lang }) })
      const data = await response.json()
      setProposal(data.text || '')
    } finally {
      setAsking(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-2xl border border-[#e5eaf0] bg-white p-6 shadow-[0_4px_16px_rgba(20,35,55,0.03)]">
        <div className="mb-6 flex items-start gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-[#e7f7f5] text-[#ea580c]"><MessageSquareText /></div><div><h2 className="text-lg font-bold">{t.clientTitle}</h2><p className="mt-1 text-sm text-slate-500">{t.clientSub}</p></div></div>
        <label className="flex flex-col gap-2 text-sm font-semibold"><span>{t.interventionDetails}</span><textarea value={details} onChange={(event) => setDetails(event.target.value)} placeholder={t.interventionPlaceholder} rows={5} className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-normal outline-none focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/15" /></label>
        <fieldset className="mt-6 flex flex-col gap-4"><legend className="mb-1 flex items-center gap-2 text-sm font-bold"><CalendarDays className="size-4 text-[#ea580c]" />{t.preferredSchedule}</legend><label className="flex flex-col gap-2 text-sm font-semibold"><span>{t.chooseDay}</span><input type="date" value={day} onChange={(event) => setDay(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 font-normal" /></label><div className="flex flex-col gap-2 text-sm font-semibold"><span>{t.chooseSlot}</span><div className="grid gap-2 sm:grid-cols-2"><button type="button" aria-pressed={slot === 'morning'} onClick={() => setSlot('morning')} className={`rounded-xl border px-3 py-3 text-left text-sm transition ${slot === 'morning' ? 'border-[#ea580c] bg-[#fff1e8] text-[#c2410c]' : 'border-slate-200 hover:border-[#ea580c]'}`}><Clock3 className="mb-1 size-4" />{t.morning}</button><button type="button" aria-pressed={slot === 'afternoon'} onClick={() => setSlot('afternoon')} className={`rounded-xl border px-3 py-3 text-left text-sm transition ${slot === 'afternoon' ? 'border-[#ea580c] bg-[#fff1e8] text-[#c2410c]' : 'border-slate-200 hover:border-[#ea580c]'}`}><Clock3 className="mb-1 size-4" />{t.afternoon}</button></div></div></fieldset>
        <label className="mt-6 flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm"><input type="checkbox" checked={reminder} onChange={(event) => setReminder(event.target.checked)} className="size-4 accent-[#ea580c]" />{t.presenceReminder}</label>
        {day && reminder && <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-950"><p className="font-bold">{t.presenceReminder}</p><p className="mt-1 leading-6">{new Date(`${day}T09:00:00`).toLocaleDateString(lang === 'FR' ? 'fr-CH' : lang === 'EN' ? 'en-CH' : 'es-CH')} · {slot === 'afternoon' ? t.afternoon : t.morning}</p><button type="button" onClick={() => { setPresenceConfirmed(true); onNotice(t.presenceConfirmed) }} className="mt-3 rounded-lg bg-orange-700 px-3 py-2 text-xs font-bold text-white">{presenceConfirmed ? t.presenceConfirmed : t.confirmPresence}</button></div>}
        <div className="mt-6 rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold">{t.invoiceDetails}</p><div className="mt-3 flex flex-col gap-2 text-sm text-slate-500"><div className="flex justify-between"><span>{t.vat}</span><span>8,1 %</span></div><div className="flex justify-between"><span>{t.insurance}</span><span className="text-right">CHF 5&apos;000&apos;000</span></div></div></div>
        <button type="button" onClick={() => onNotice(t.requestSent)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-700 px-4 py-3 text-sm font-semibold text-white hover:bg-[#c2410c]"><Check className="size-4" />{t.requestQuote}</button>
      </section>
      <section className="flex flex-col gap-6"><div className="rounded-2xl border border-[#e5eaf0] bg-[#152238] p-6 text-white"><h2 className="text-lg font-bold">{t.assistantTitle}</h2><p className="mt-1 text-sm leading-6 text-slate-300">{t.clientSub}</p><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={t.assistantPlaceholder} rows={4} className="mt-5 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-sm text-white outline-none placeholder:text-slate-400" /><button type="button" disabled={asking} onClick={askAssistant} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#f97316] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"><Send className="size-4" />{asking ? '…' : t.assistantSend}</button>{proposal && <div className="mt-5 rounded-xl bg-white/10 p-4 text-sm leading-6 text-slate-100">{proposal}</div>}</div><div className="rounded-2xl border border-[#e5eaf0] bg-white p-6"><p className="text-sm font-bold">{t.payment}</p><p className="mt-2 text-sm text-slate-500">{t.total}: <strong className="text-[#152238]">CHF {estimatedTotal.toFixed(2)}</strong></p><button type="button" onClick={() => setPaymentOpen(true)} className="mt-4 w-full rounded-xl border border-[#ea580c] px-4 py-3 text-sm font-semibold text-[#c2410c]">{t.payment}</button>{paymentOpen && <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-bold">{t.paymentBreakdown}</h3><p className="mt-1 text-xs text-slate-500">{t.companyDetails}</p></div><button type="button" onClick={() => setPaymentOpen(false)} aria-label="Close" className="text-xl text-slate-400">×</button></div><div className="mt-5 flex flex-col gap-2 border-y border-slate-100 py-4 text-sm"><div className="flex justify-between"><span>{t.total}</span><span>CHF {estimatedNet.toFixed(2)}</span></div><div className="flex justify-between"><span>{t.vat}</span><span>CHF {vatAmount.toFixed(2)}</span></div><div className="flex justify-between font-bold"><span>Total CHF</span><span>CHF {estimatedTotal.toFixed(2)}</span></div></div><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={() => onNotice(`${t.cardPayment} · ${t.payment}`)} className="rounded-xl bg-slate-900 px-3 py-3 text-sm font-bold text-white">{t.cardPayment}</button><button type="button" onClick={() => onNotice(`${t.twintPayment} · ${t.payment}`)} className="rounded-xl bg-[#e7f7f5] px-3 py-3 text-sm font-bold text-slate-900">{t.twintPayment}</button></div><div className="mt-5 flex flex-col items-center gap-2 rounded-xl bg-slate-50 p-4 text-center"><div className="grid size-28 grid-cols-7 gap-1 bg-white p-2" aria-label="QR de paiement simulé">{Array.from({ length: 49 }, (_, index) => <span key={index} className={(index * 17 + 3) % 5 < 2 ? 'bg-slate-900' : 'bg-white'} />)}</div><p className="text-xs text-slate-500">TWINT / tarjeta · CHF {estimatedTotal.toFixed(2)}</p></div></div></div>}</div></section>
    </div>
  )
}
