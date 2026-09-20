'use client'

import { useState, useEffect } from 'react'
import { getBookings, addBooking, updateBookingPayment } from '@/app/actions/dashboard'
import { Plus, Calendar } from 'lucide-react'

export function BookingModule({ t }: { t: any }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [showAddBooking, setShowAddBooking] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ room: '', customer: '', startsAt: '', endsAt: '', price: '' })

  const rooms = ['Sala Mediterráneo', 'Sala Ejecutiva', 'Sala Panorama', 'Sala Terraza']

  useEffect(() => {
    loadBookings()
  }, [])

  async function loadBookings() {
    try {
      const data = await getBookings()
      setBookings(data)
    } catch (error) {
      console.error('[v0] Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddBooking() {
    if (!formData.room || !formData.customer || !formData.startsAt || !formData.endsAt || !formData.price) return
    try {
      await addBooking(formData.room, formData.customer, new Date(formData.startsAt), new Date(formData.endsAt), formData.price)
      setFormData({ room: '', customer: '', startsAt: '', endsAt: '', price: '' })
      setShowAddBooking(false)
      await loadBookings()
    } catch (error) {
      console.error('[v0] Error adding booking:', error)
      setError(error instanceof Error ? error.message : 'No se pudo guardar la reserva')
    }
  }

  if (loading) return <div className="text-center py-8 text-slate-500">Cargando reservas...</div>

  return (
    <div className="flex flex-col gap-6">
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      {showAddBooking && (
        <div className="rounded-2xl border border-[#e5eaf0] bg-white p-6">
          <h3 className="font-bold mb-4">Nueva Reserva</h3>
          <div className="grid gap-3">
            <select value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Selecciona sala</option>
              {rooms.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <input type="text" placeholder="Cliente" value={formData.customer} onChange={(e) => setFormData({...formData, customer: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
            <input type="datetime-local" value={formData.startsAt} onChange={(e) => setFormData({...formData, startsAt: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
            <input type="datetime-local" value={formData.endsAt} onChange={(e) => setFormData({...formData, endsAt: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" placeholder="Precio (€)" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
            <div className="flex gap-2">
              <button onClick={handleAddBooking} className="px-4 py-2 bg-[#16aaa2] text-white rounded-lg text-sm font-semibold">Guardar</button>
              <button onClick={() => setShowAddBooking(false)} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setShowAddBooking(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#12243d] text-white rounded-lg text-sm font-semibold"><Plus className="size-4" /> Nueva Reserva</button>

      <div className="rounded-2xl border border-[#e5eaf0] bg-white p-5">
        <h3 className="font-bold mb-4">Reservas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-slate-400">
                <th className="pb-3 text-left font-semibold">Sala</th>
                <th className="pb-3 text-left font-semibold">Cliente</th>
                <th className="pb-3 text-left font-semibold">Fecha Inicio</th>
                <th className="pb-3 text-left font-semibold">Precio</th>
                <th className="pb-3 text-left font-semibold">Pagado</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const total = parseFloat(booking.price)
                const paid = parseFloat(booking.paid)
                const balance = total - paid
                const status = balance === 0 ? 'Pagado' : paid > 0 ? 'Parcial' : 'Pendiente'
                return (
                  <tr key={booking.id} className="border-b text-sm">
                    <td className="py-3 font-semibold">{booking.room}</td>
                    <td className="py-3">{booking.customer}</td>
                    <td className="py-3 text-slate-500">{new Date(booking.startsAt).toLocaleDateString()}</td>
                    <td className="py-3">${booking.price}</td>
                    <td className="py-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${status === 'Pagado' ? 'bg-emerald-50 text-emerald-700' : status === 'Parcial' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{status}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
