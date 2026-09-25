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
        <div className="mt-6 rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold">{t.invoiceDetails}</p><div className="mt-3 flex flex-col gap-2 text-sm text-slate-500"><div className="flex justify-between"><span>{t.vat}</span><span>8,1 %</span></div><div className="flex justify-between"><span>{t.insurance}</span><span className="text-right">CHF 5&apos;000&apos;000</span></div></div></div>
        <button type="button" onClick={() => onNotice(t.requestSent)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-700 px-4 py-3 text-sm font-semibold text-white hover:bg-[#c2410c]"><Check className="size-4" />{t.requestQuote}</button>
      </section>
      <section className="flex flex-col gap-6"><div className="rounded-2xl border border-[#e5eaf0] bg-[#152238] p-6 text-white"><h2 className="text-lg font-bold">{t.assistantTitle}</h2><p className="mt-1 text-sm leading-6 text-slate-300">{t.clientSub}</p><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={t.assistantPlaceholder} rows={4} className="mt-5 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-sm text-white outline-none placeholder:text-slate-400" /><button type="button" disabled={asking} onClick={askAssistant} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#f97316] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"><Send className="size-4" />{asking ? '…' : t.assistantSend}</button>{proposal && <div className="mt-5 rounded-xl bg-white/10 p-4 text-sm leading-6 text-slate-100">{proposal}</div>}</div><div className="rounded-2xl border border-[#e5eaf0] bg-white p-6"><p className="text-sm font-bold">{t.payment}</p><p className="mt-2 text-sm text-slate-500">{t.total}: <strong className="text-[#152238]">CHF 0.00</strong></p><button type="button" onClick={() => onNotice(t.payment)} className="mt-4 w-full rounded-xl border border-[#ea580c] px-4 py-3 text-sm font-semibold text-[#c2410c]">{t.payment}</button></div></section>
    </div>
  )
}
