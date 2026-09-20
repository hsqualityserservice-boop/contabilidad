'use client'

import { useState, useEffect, useRef } from 'react'
import { getCars, addCar, addFuelRecord } from '@/app/actions/dashboard'
import { Plus, Fuel, ImagePlus, X } from 'lucide-react'

export function FleetModule({ t }: { t: any }) {
  const [cars, setCars] = useState<any[]>([])
  const [showAddCar, setShowAddCar] = useState(false)
  const [showAddFuel, setShowAddFuel] = useState(false)
  const [selectedCar, setSelectedCar] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [vehicleImage, setVehicleImage] = useState<File | null>(null)
  const [vehicleImagePreview, setVehicleImagePreview] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({ plate: '', model: '', date: '', cost: '', liters: '', odometer: '' })

  useEffect(() => {
    loadCars()
  }, [])

  async function loadCars() {
    try {
      const data = await getCars()
      setCars(data)
    } catch (error) {
      console.error('[v0] Error loading cars:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddCar() {
    if (!formData.plate || !formData.model) return
    try {
      let imageUrl: string | undefined
      if (vehicleImage) {
        const uploadData = new FormData()
        uploadData.append('file', vehicleImage)
        const response = await fetch('/api/upload', { method: 'POST', body: uploadData })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'No se pudo subir la imagen')
        imageUrl = `/api/file?pathname=${encodeURIComponent(payload.pathname)}`
      }
      await addCar(formData.plate, formData.model, imageUrl)
      setFormData({ plate: '', model: '', date: '', cost: '', liters: '', odometer: '' })
      setVehicleImage(null)
      setVehicleImagePreview(null)
      setShowAddCar(false)
      await loadCars()
    } catch (error) {
      console.error('[v0] Error adding car:', error)
      setError(error instanceof Error ? error.message : 'No se pudo guardar el vehículo')
    }
  }

  async function handleAddFuel() {
    if (!selectedCar || !formData.date || !formData.cost || !formData.liters || !formData.odometer) return
    try {
      await addFuelRecord(selectedCar, new Date(formData.date), formData.cost, formData.liters, parseInt(formData.odometer))
      setFormData({ plate: '', model: '', date: '', cost: '', liters: '', odometer: '' })
      setShowAddFuel(false)
      await loadCars()
    } catch (error) {
      console.error('[v0] Error adding fuel:', error)
    }
  }

  if (loading) return <div className="text-center py-8 text-slate-500">Cargando flota...</div>

  return (
    <div className="flex flex-col gap-6">
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      {showAddCar && (
        <div className="rounded-2xl border border-[#e5eaf0] bg-white p-6">
          <h3 className="font-bold mb-4">Añadir Vehículo</h3>
          <div className="grid gap-3">
            <input type="text" placeholder="Matrícula" value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" placeholder="Modelo" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
            <input ref={imageInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setVehicleImage(file); setVehicleImagePreview(URL.createObjectURL(file)) } }} />
            <button type="button" onClick={() => imageInputRef.current?.click()} className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#9ddbd6] bg-[#effaf9] px-3 py-5 text-sm font-semibold text-[#168e88]"><ImagePlus className="size-5" /> Añadir foto del vehículo</button>
            {vehicleImagePreview && <div className="relative overflow-hidden rounded-xl border border-slate-200"><img src={vehicleImagePreview} alt="Vista previa del vehículo" className="h-40 w-full object-cover" /><button type="button" onClick={() => { setVehicleImage(null); setVehicleImagePreview(null) }} className="absolute right-2 top-2 rounded-full bg-white p-1 shadow" aria-label="Quitar foto"><X className="size-4" /></button></div>}
            <div className="flex gap-2">
              <button onClick={handleAddCar} className="px-4 py-2 bg-[#16aaa2] text-white rounded-lg text-sm font-semibold">Guardar</button>
              <button onClick={() => setShowAddCar(false)} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showAddFuel && (
        <div className="rounded-2xl border border-[#e5eaf0] bg-white p-6">
          <h3 className="font-bold mb-4">Registrar Combustible</h3>
          <div className="grid gap-3">
            <select value={selectedCar ?? ''} onChange={(e) => setSelectedCar(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Selecciona vehículo</option>
              {cars.map((car) => <option key={car.id} value={car.id}>{car.plate}</option>)}
            </select>
            <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" placeholder="Costo (€)" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" placeholder="Litros" value={formData.liters} onChange={(e) => setFormData({...formData, liters: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" placeholder="Odómetro" value={formData.odometer} onChange={(e) => setFormData({...formData, odometer: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
            <div className="flex gap-2">
              <button onClick={handleAddFuel} className="px-4 py-2 bg-[#16aaa2] text-white rounded-lg text-sm font-semibold">Guardar</button>
              <button onClick={() => setShowAddFuel(false)} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => setShowAddCar(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#12243d] text-white rounded-lg text-sm font-semibold"><Plus className="size-4" /> Nuevo Vehículo</button>
        <button onClick={() => setShowAddFuel(true)} className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold"><Fuel className="size-4" /> Registrar Combustible</button>
      </div>

      <div className="rounded-2xl border border-[#e5eaf0] bg-white p-5">
        <h3 className="font-bold mb-4">Vehículos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-slate-400">
                <th className="pb-3 text-left font-semibold">Foto</th>
                <th className="pb-3 text-left font-semibold">Matrícula</th>
                <th className="pb-3 text-left font-semibold">Modelo</th>
                <th className="pb-3 text-left font-semibold">Estado</th>
                <th className="pb-3 text-left font-semibold">Odómetro</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id} className="border-b text-sm">
                  <td className="py-3"><div className="flex size-12 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">{car.imageUrl ? <img src={car.imageUrl} alt={`Vehículo ${car.plate}`} className="size-full object-cover" /> : <ImagePlus className="size-4" />}</div></td>
                  <td className="py-3 font-bold">{car.plate}</td>
                  <td className="py-3">{car.model}</td>
                  <td className="py-3"><span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold">{car.status}</span></td>
                  <td className="py-3 text-slate-500">{car.odometer} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
