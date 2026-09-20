'use client'

import { useMemo, useRef, useState } from 'react'
import { CalendarDays, Camera, Check, FileText, Filter, FolderOpen, Gavel, Loader2, Plus, Upload, Wrench } from 'lucide-react'

type View = 'day' | 'week' | 'month' | 'year'
type Area = 'vehicle' | 'corporate'

const vehicleDocs = [
  { id: 'insurance', label: 'Seguros y pólizas', icon: FileText },
  { id: 'maintenance', label: 'Reparaciones y repuestos', icon: Wrench },
  { id: 'fines', label: 'Multas y sanciones', icon: Gavel },
] as const

const corporateDocs = ['Contratos de alquiler', 'Obligaciones fiscales', 'Garantías de equipamiento', 'Pólizas corporativas']

export function OperationsHub({ t, onNotice }: { t: any; onNotice: (message: string) => void }) {
  const [area, setArea] = useState<Area>('vehicle')
  const [view, setView] = useState<View>('week')
  const [category, setCategory] = useState('insurance')
  const [files, setFiles] = useState<{ name: string; category: string; uploadedAt: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const days = useMemo(() => ['Lun 21', 'Mar 22', 'Mié 23', 'Jue 24', 'Vie 25', 'Sáb 26', 'Dom 27'], [])

  async function uploadFile(file: File) {
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    form.append('category', area === 'vehicle' ? category : 'corporate')
    try {
      const response = await fetch('/api/upload', { method: 'POST', body: form })
      if (!response.ok) throw new Error('upload')
      setFiles((current) => [{ name: file.name, category: area === 'vehicle' ? category : 'corporate', uploadedAt: new Date().toLocaleDateString('es-ES') }, ...current])
      onNotice('Documento guardado correctamente')
    } catch {
      onNotice('No se pudo guardar el documento')
    } finally {
      setUploading(false)
    }
  }

  return <div className="flex flex-col gap-6">
    <div className="grid gap-4 xl:grid-cols-[1fr_1.45fr]">
      <section className="rounded-2xl border border-[#e5eaf0] bg-white p-5 shadow-[0_4px_16px_rgba(20,35,55,0.03)]">
        <div className="mb-5 flex items-start justify-between"><div><h2 className="text-[15px] font-bold">Repositorio documental</h2><p className="mt-1 text-xs text-slate-500">Vehículos y documentación corporativa</p></div><FolderOpen className="text-[#16aaa2]" /></div>
        <div className="mb-4 flex gap-2 rounded-xl bg-slate-50 p-1"><button onClick={() => setArea('vehicle')} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${area === 'vehicle' ? 'bg-white text-[#16aaa2] shadow-sm' : 'text-slate-500'}`}>Vehículos</button><button onClick={() => setArea('corporate')} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${area === 'corporate' ? 'bg-white text-[#16aaa2] shadow-sm' : 'text-slate-500'}`}>Corporativa</button></div>
        <div className="flex flex-col gap-2">{area === 'vehicle' ? vehicleDocs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setCategory(id)} className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm ${category === id ? 'border-[#9adfd9] bg-[#effaf8] text-[#168b84]' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}><Icon className="size-4" />{label}<span className="ml-auto text-xs text-slate-400">{files.filter((file) => file.category === id).length}</span></button>) : corporateDocs.map((label) => <button key={label} onClick={() => setCategory(label)} className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm ${category === label ? 'border-[#9adfd9] bg-[#effaf8] text-[#168b84]' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}><FileText className="size-4" />{label}</button>)}</div>
        <input ref={fileRef} type="file" accept="application/pdf,image/*" capture="environment" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFile(file); event.currentTarget.value = '' }} />
        <div className="mt-5 grid grid-cols-2 gap-2"><button disabled={uploading} onClick={() => fileRef.current?.click()} className="flex items-center justify-center gap-2 rounded-xl bg-[#12243d] px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-60"><Upload className="size-4" />{uploading ? <Loader2 className="size-4 animate-spin" /> : 'Subir PDF'}</button><button disabled={uploading} onClick={() => fileRef.current?.click()} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600"><Camera className="size-4" />Cámara móvil</button></div>
        <div className="mt-5 flex flex-col gap-2">{files.slice(0, 4).map((file) => <div key={`${file.name}-${file.uploadedAt}`} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs"><Check className="size-3 text-emerald-500" /><span className="min-w-0 flex-1 truncate">{file.name}</span><span className="text-slate-400">{file.uploadedAt}</span></div>)}</div>
      </section>
      <section className="rounded-2xl border border-[#e5eaf0] bg-white p-5 shadow-[0_4px_16px_rgba(20,35,55,0.03)]"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-[15px] font-bold">Calendario operativo</h2><p className="mt-1 text-xs text-slate-500">Eventos, trabajos y facturación asignada</p></div><button onClick={() => onNotice('Formulario de nuevo evento listo')} className="flex items-center gap-1.5 rounded-lg bg-[#e7f7f5] px-3 py-2 text-xs font-bold text-[#168b84]"><Plus className="size-4" />Evento</button></div><div className="mb-4 flex items-center justify-between"><div className="flex gap-1 rounded-lg bg-slate-50 p-1">{(['day', 'week', 'month', 'year'] as View[]).map((item) => <button key={item} onClick={() => setView(item)} className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold capitalize ${view === item ? 'bg-white text-[#168b84] shadow-sm' : 'text-slate-400'}`}>{item === 'day' ? 'Día' : item === 'week' ? 'Semana' : item === 'month' ? 'Mes' : 'Año'}</button>)}</div><button onClick={() => onNotice('Filtros del calendario')} aria-label="Filtrar calendario"><Filter className="size-4 text-slate-400" /></button></div><div className="overflow-x-auto rounded-xl border border-slate-100"><div className="grid min-w-[620px] grid-cols-7"><div className="border-b border-r border-slate-100 bg-slate-50 p-2 text-[10px] text-slate-400">09:00</div>{days.map((day) => <div key={day} className="border-b border-slate-100 bg-slate-50 p-2 text-center text-[10px] font-bold text-slate-500">{day}</div>)}{['10:00', '12:00', '14:00', '16:00'].map((time, index) => <div key={time} className="contents"><div className="h-16 border-b border-r border-slate-100 p-2 text-[10px] text-slate-400">{time}</div>{days.map((day, dayIndex) => <div key={`${time}-${day}`} className="h-16 border-b border-slate-100 p-1">{(index === 1 && dayIndex === 1 || index === 2 && dayIndex === 4) && <button onClick={() => onNotice('Evento seleccionado')} className="h-full w-full rounded-lg bg-[#e7f7f5] p-2 text-left text-[10px] font-semibold text-[#168b84]">{dayIndex === 1 ? 'Revisión Toyota' : 'Entrega sala 04'}<span className="mt-1 block font-normal text-slate-500">€240 · Carlos</span></button>}</div>)}</div>)}</div></div></section>
    </div>
    <section className="rounded-2xl border border-[#e5eaf0] bg-white p-5 shadow-[0_4px_16px_rgba(20,35,55,0.03)]"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-[15px] font-bold">Seguimiento de costes y mantenimiento</h2><p className="mt-1 text-xs text-slate-500">Repuestos, mano de obra, multas y trabajos realizados</p></div><button onClick={() => onNotice('Nuevo registro de gasto listo')} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"><Plus className="size-4" />Añadir registro</button></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-amber-50 p-4"><p className="text-xs text-amber-700">Mantenimiento este mes</p><p className="mt-1 text-xl font-bold text-amber-900">€1.690</p></div><div className="rounded-xl bg-rose-50 p-4"><p className="text-xs text-rose-700">Multas pendientes</p><p className="mt-1 text-xl font-bold text-rose-900">€320</p></div><div className="rounded-xl bg-[#effaf8] p-4"><p className="text-xs text-[#168b84]">Documentos archivados</p><p className="mt-1 text-xl font-bold text-[#12243d]">{files.length + 24}</p></div></div></section>
  </div>
}

export default OperationsHub
