'use client'

import { useEffect, useRef, useState } from 'react'
import { addCar, addFuelRecord, getCars } from '@/app/actions/dashboard'
import { CarFront, Check, FileImage, FileText, Fuel, ImagePlus, Plus, ShieldCheck, Upload, Wrench, X } from 'lucide-react'

type DocumentCategory = 'carte grise' | 'seguro' | 'mantenimiento' | 'reparaciones' | 'multas'

const documentCategories: { key: DocumentCategory; label: string; icon: typeof FileText }[] = [
  { key: 'carte grise', label: 'Carte grise', icon: FileText },
  { key: 'seguro', label: 'Seguro', icon: ShieldCheck },
  { key: 'mantenimiento', label: 'Mantenimiento', icon: Wrench },
  { key: 'reparaciones', label: 'Reparaciones', icon: Wrench },
  { key: 'multas', label: 'Multas', icon: FileText },
]

export function FleetModule({ t }: { t: any }) {
  const [cars, setCars] = useState<any[]>([])
  const [showAddCar, setShowAddCar] = useState(false)
  const [showAddFuel, setShowAddFuel] = useState(false)
  const [selectedCar, setSelectedCar] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [vehicleImage, setVehicleImage] = useState<File | null>(null)
  const [vehicleImagePreview, setVehicleImagePreview] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Record<string, { name: string; url: string }[]>>({})
  const [leasing, setLeasing] = useState<Record<string, { active: boolean; amount: string }>>({})
  const imageInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)
  const [documentCategory, setDocumentCategory] = useState<DocumentCategory>('carte grise')
  const [formData, setFormData] = useState({ plate: '', model: '', date: '', cost: '', liters: '', odometer: '' })

  useEffect(() => { loadCars() }, [])

  async function loadCars() {
    try { setCars(await getCars()) } catch (err) { console.error('[v0] Error loading cars:', err) } finally { setLoading(false) }
  }

  async function handleAddCar() {
    if (!formData.plate || !formData.model) return
    try {
      let imageUrl: string | undefined
      if (vehicleImage) {
        const body = new FormData(); body.append('file', vehicleImage)
        const response = await fetch('/api/upload', { method: 'POST', body }); const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'No se pudo subir la imagen')
        imageUrl = `/api/file?pathname=${encodeURIComponent(payload.pathname)}`
      }
      await addCar(formData.plate, formData.model, imageUrl)
      setFormData({ plate: '', model: '', date: '', cost: '', liters: '', odometer: '' }); setVehicleImage(null); setVehicleImagePreview(null); setShowAddCar(false); await loadCars()
    } catch (err) { console.error('[v0] Error adding car:', err); setError(err instanceof Error ? err.message : 'No se pudo guardar el vehículo') }
  }

  async function handleAddFuel() {
    if (!selectedCar || !formData.date || !formData.cost || !formData.liters || !formData.odometer) return
    try { await addFuelRecord(selectedCar.id, new Date(formData.date), formData.cost, formData.liters, parseInt(formData.odometer)); setFormData({ plate: '', model: '', date: '', cost: '', liters: '', odometer: '' }); setShowAddFuel(false); await loadCars() } catch (err) { console.error('[v0] Error adding fuel:', err) }
  }

  function addDocument(file: File) {
    if (!selectedCar) return
    const url = URL.createObjectURL(file)
    setDocuments((current) => ({ ...current, [`${selectedCar.id}-${documentCategory}`]: [...(current[`${selectedCar.id}-${documentCategory}`] || []), { name: file.name, url }] }))
  }

  if (loading) return <div className="py-8 text-center text-slate-500">Cargando flota...</div>

  return <div className="flex flex-col gap-6">
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div><p className="text-sm font-semibold text-orange-600">Control documental y financiero</p><p className="mt-1 text-sm text-slate-500">Cada vehículo, con todos sus documentos en un único lugar.</p></div>
      <div className="flex gap-2"><button onClick={() => setShowAddCar(true)} className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700"><Plus className="size-4" /> Nuevo vehículo</button><button onClick={() => setShowAddFuel(true)} className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-orange-700 hover:bg-orange-50"><Fuel className="size-4" /> Combustible</button></div>
    </div>

    {showAddCar && <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold">Añadir vehículo</h2><p className="text-sm text-slate-500">Empieza creando la ficha del vehículo.</p></div><button onClick={() => setShowAddCar(false)} aria-label="Cerrar" className="rounded-lg p-2 hover:bg-orange-50"><X className="size-4" /></button></div><div className="grid gap-3 sm:grid-cols-2"><input type="text" placeholder="Matrícula" value={formData.plate} onChange={(e) => setFormData({ ...formData, plate: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500" /><input type="text" placeholder="Modelo y versión" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500" /></div><input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setVehicleImage(file); setVehicleImagePreview(URL.createObjectURL(file)) } }} /><button type="button" onClick={() => imageInputRef.current?.click()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-orange-300 bg-orange-50 px-3 py-5 text-sm font-semibold text-orange-700"><ImagePlus className="size-5" /> Añadir foto del vehículo</button>{vehicleImagePreview && <img src={vehicleImagePreview} alt="Vista previa del vehículo" className="mt-3 h-40 w-full rounded-xl object-cover" />}<div className="mt-4 flex gap-2"><button onClick={handleAddCar} className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white">Guardar vehículo</button><button onClick={() => setShowAddCar(false)} className="rounded-xl border px-4 py-2 text-sm">Cancelar</button></div></section>}

    {showAddFuel && <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"><h2 className="mb-4 font-bold">Registrar combustible</h2><div className="grid gap-3 sm:grid-cols-2"><select value={selectedCar?.id ?? ''} onChange={(e) => setSelectedCar(cars.find((car) => car.id === e.target.value) || null)} className="rounded-xl border px-3 py-2.5 text-sm"><option value="">Selecciona vehículo</option>{cars.map((car) => <option key={car.id} value={car.id}>{car.plate}</option>)}</select><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="rounded-xl border px-3 py-2.5 text-sm" /><input type="number" placeholder="Costo (€)" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} className="rounded-xl border px-3 py-2.5 text-sm" /><input type="number" placeholder="Litros" value={formData.liters} onChange={(e) => setFormData({ ...formData, liters: e.target.value })} className="rounded-xl border px-3 py-2.5 text-sm" /><input type="number" placeholder="Odómetro" value={formData.odometer} onChange={(e) => setFormData({ ...formData, odometer: e.target.value })} className="rounded-xl border px-3 py-2.5 text-sm" /></div><div className="mt-4 flex gap-2"><button onClick={handleAddFuel} className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white">Guardar</button><button onClick={() => setShowAddFuel(false)} className="rounded-xl border px-4 py-2 text-sm">Cancelar</button></div></section>}

    <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold">Vehículos</h2><p className="text-xs text-slate-500">Selecciona uno para abrir su ficha completa.</p></div><span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{cars.length} registrados</span></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{cars.map((car) => <button key={car.id} onClick={() => setSelectedCar(car)} className="group rounded-2xl border border-slate-200 p-3 text-left transition hover:border-orange-400 hover:shadow-md"><div className="flex gap-3"><div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-50 text-orange-400">{car.imageUrl ? <img src={car.imageUrl} alt={`Vehículo ${car.plate}`} className="size-full object-cover" /> : <CarFront className="size-7" />}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="font-bold">{car.plate}</p><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{car.status}</span></div><p className="truncate text-sm text-slate-600">{car.model}</p><p className="mt-1 text-xs text-slate-400">{car.odometer} km</p></div></div><div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-orange-700"><span>Ver ficha y documentos</span><span className="font-bold">→</span></div></button>)}</div>{cars.length === 0 && <div className="rounded-xl bg-orange-50 p-8 text-center text-sm text-slate-500">Aún no tienes vehículos registrados.</div>}</section>

    {selectedCar && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="vehicle-title"><div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">Ficha individual</p><h2 id="vehicle-title" className="mt-1 text-2xl font-bold">{selectedCar.plate}</h2><p className="text-sm text-slate-500">{selectedCar.model} · {selectedCar.odometer} km</p></div><button onClick={() => setSelectedCar(null)} aria-label="Cerrar ficha" className="rounded-xl p-2 hover:bg-orange-50"><X className="size-5" /></button></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-orange-50 p-4"><p className="text-xs font-semibold text-orange-700">Leasing</p><div className="mt-3 flex items-center justify-between"><span className="text-sm font-bold">¿Está en leasing?</span><button onClick={() => setLeasing((current) => ({ ...current, [selectedCar.id]: { active: !current[selectedCar.id]?.active, amount: current[selectedCar.id]?.amount || '' } }))} className={`relative h-6 w-11 rounded-full transition ${leasing[selectedCar.id]?.active ? 'bg-orange-600' : 'bg-slate-300'}`} aria-pressed={leasing[selectedCar.id]?.active || false}><span className={`absolute top-1 size-4 rounded-full bg-white transition ${leasing[selectedCar.id]?.active ? 'left-6' : 'left-1'}`} /></button></div>{leasing[selectedCar.id]?.active && <div className="mt-3 flex items-center rounded-xl border border-orange-200 bg-white px-3"><span className="text-sm text-slate-400">€</span><input type="number" placeholder="Monto mensual" value={leasing[selectedCar.id]?.amount || ''} onChange={(e) => setLeasing((current) => ({ ...current, [selectedCar.id]: { active: true, amount: e.target.value } }))} className="w-full bg-transparent px-2 py-2 text-sm outline-none" /></div>}</div><div className="rounded-2xl border border-slate-200 p-4"><p className="text-xs font-semibold text-slate-500">Resumen económico</p><p className="mt-2 text-2xl font-bold">{leasing[selectedCar.id]?.active && leasing[selectedCar.id]?.amount ? `€${leasing[selectedCar.id].amount}/mes` : 'Sin leasing'}</p><p className="mt-1 text-xs text-slate-400">Cuota mensual declarada</p></div></div><div className="mt-6"><div className="mb-3 flex items-end justify-between"><div><h3 className="font-bold">Documentación del vehículo</h3><p className="text-xs text-slate-500">Fotos o PDFs de cada categoría.</p></div><div className="flex items-center gap-2"><select value={documentCategory} onChange={(e) => setDocumentCategory(e.target.value as DocumentCategory)} className="rounded-xl border border-orange-200 px-3 py-2 text-xs font-semibold text-orange-700">{documentCategories.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}</select><input ref={documentInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) addDocument(file); e.currentTarget.value = '' }} /><button onClick={() => documentInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-3 py-2 text-xs font-bold text-white hover:bg-orange-700"><Upload className="size-3.5" /> Subir</button></div></div><div className="grid gap-2 sm:grid-cols-2">{documentCategories.map(({ key, label, icon: Icon }) => { const items = documents[`${selectedCar.id}-${key}`] || []; return <div key={key} className="rounded-2xl border border-slate-200 p-3"><div className="flex items-center gap-2 text-sm font-bold"><Icon className="size-4 text-orange-600" />{label}<span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{items.length}</span></div>{items.length > 0 ? items.map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 truncate rounded-lg bg-orange-50 px-2 py-2 text-xs text-orange-700"><FileImage className="size-3.5 shrink-0" />{item.name}</a>) : <p className="mt-2 text-xs text-slate-400">Sin documentos añadidos</p>}</div> })}</div></div><div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700"><Check className="size-4" /> La ficha está lista para centralizar los documentos de este vehículo.</div></div></div>}
  </div>
}
