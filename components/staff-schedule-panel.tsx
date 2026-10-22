'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, Check, Clock3 } from 'lucide-react'
import { respondToScheduleProposal, saveStaffWeeklyAvailability, proposeStaffSchedule } from '@/app/actions/account'
import type { Locale } from '@/lib/i18n'
import { schedulingCopy, weekdays, type AvailabilityWindow, type SuggestedScheduleSlot } from '@/lib/scheduling-copy'

type StaffScheduleRequest = {
  id: string
  serviceType: string
  surfaceArea: number
  estimatedHours: number
  preferredDate: string | null
  proposalDate: string | null
  proposalStartTime: string | null
  proposalEndTime: string | null
  proposalStatus: 'proposed' | 'client_accepted' | 'approved' | 'declined' | 'cancelled' | null
  suggestions: SuggestedScheduleSlot[]
}

function switzerlandToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

export function StaffSchedulePanel({ locale, availability: savedAvailability, requests }: {
  locale: Locale
  availability: AvailabilityWindow[]
  requests: StaffScheduleRequest[]
}) {
  const router = useRouter()
  const t = schedulingCopy(locale)
  const [isPending, startTransition] = useTransition()
  const [availability, setAvailability] = useState(() => savedAvailability.map(({ weekday, startTime, endTime }) => ({ weekday, startTime, endTime })))
  const [feedback, setFeedback] = useState('')
  const days = weekdays(locale)

  function updateWindow(weekday: number, patch: Partial<{ startTime: string; endTime: string }>) {
    setAvailability((current) => {
      const existing = current.find((item) => item.weekday === weekday)
      if (!existing) return [...current, { weekday, startTime: patch.startTime ?? '09:00', endTime: patch.endTime ?? '17:00' }].sort((a, b) => a.weekday - b.weekday)
      return current.map((item) => item.weekday === weekday ? { ...item, ...patch } : item)
    })
  }

  function submitAvailability(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback('')
    startTransition(async () => {
      const result = await saveStaffWeeklyAvailability(availability)
      setFeedback(result.ok ? t.saved : t.scheduleError)
      if (result.ok) router.refresh()
    })
  }

  return <section className="staff-scheduling" aria-labelledby="staff-availability-title">
    <div className="staff-scheduling-heading"><div><p className="auth-eyebrow">{t.timeZone}</p><h2 id="staff-availability-title">{t.availability}</h2><p>{t.availabilityHint}</p></div><span className="staff-scheduling-icon"><CalendarClock aria-hidden="true" /></span></div>
    <form className="staff-availability-form" onSubmit={submitAvailability}>
      <div className="staff-availability-list">{days.map((day, index) => {
        const weekday = index + 1
        const window = availability.find((item) => item.weekday === weekday)
        return <div className={`staff-availability-row ${window ? 'staff-availability-row-active' : ''}`} key={weekday}>
          <label className="staff-availability-day"><input type="checkbox" checked={Boolean(window)} onChange={(event) => setAvailability((current) => event.target.checked ? [...current, { weekday, startTime: '09:00', endTime: '17:00' }].sort((a, b) => a.weekday - b.weekday) : current.filter((item) => item.weekday !== weekday))} /><span>{day}</span></label>
          {window ? <div className="staff-availability-times">
            <label>{t.from}<input type="time" value={window.startTime} onChange={(event) => updateWindow(weekday, { startTime: event.target.value })} required /></label>
            <label>{t.to}<input type="time" value={window.endTime} onChange={(event) => updateWindow(weekday, { endTime: event.target.value })} required /></label>
          </div> : <span className="staff-availability-off">—</span>}
        </div>
      })}</div>
      <button className="admin-approve-button" type="submit" disabled={isPending}>{t.saveAvailability}</button>
      {feedback && <p className="staff-schedule-feedback" role="status">{feedback}</p>}
    </form>

    <div className="staff-schedule-requests">
      <div className="staff-scheduling-heading"><div><p className="auth-eyebrow">{t.status}</p><h2>{t.scheduleRequests}</h2><p>{t.scheduleRequestsHint}</p></div><span className="staff-scheduling-icon"><Clock3 aria-hidden="true" /></span></div>
      {requests.length === 0 ? <p className="staff-schedule-empty">{t.noScheduleRequests}</p> : <div className="staff-schedule-request-list">{requests.map((request) => <article className="staff-schedule-request" key={request.id}>
        <div className="staff-schedule-request-heading"><strong>{request.serviceType.replaceAll('_', ' ')}</strong><span>{request.surfaceArea} m² · {request.estimatedHours} h</span></div>
        {request.proposalStatus === 'client_accepted' ? <p className="staff-schedule-notice"><Check aria-hidden="true" />{t.awaitingAdmin}</p> : request.proposalStatus === 'proposed' ? <p className="staff-schedule-notice"><Clock3 aria-hidden="true" />{t.awaitingClient}: {request.proposalDate} · {request.proposalStartTime?.slice(0, 5)}</p> : <>
          <p className="staff-schedule-preferred">{t.preferred}: {request.preferredDate ?? t.noAvailability}</p>
          {request.suggestions.length === 0 ? <p className="staff-schedule-empty">{t.noSuggestions}</p> : <div className="staff-schedule-slots">{request.suggestions.map((slot: SuggestedScheduleSlot) => <form action={proposeStaffSchedule.bind(null, request.id)} key={`${slot.appointmentDate}-${slot.startTime}`}>
            <input type="hidden" name="appointmentDate" value={slot.appointmentDate} />
            <input type="hidden" name="startTime" value={slot.startTime} />
            <button type="submit" className="staff-schedule-slot"><span>{new Intl.DateTimeFormat(`${locale}-CH`, { dateStyle: 'medium' }).format(new Date(`${slot.appointmentDate}T12:00:00`))}</span><strong>{slot.startTime}–{slot.endTime}</strong><small>{t.chooseSlot}</small></button>
          </form>)}</div>}
          <form className="staff-schedule-manual" action={proposeStaffSchedule.bind(null, request.id)}>
            <label>{t.appointmentDate}<input name="appointmentDate" type="date" min={switzerlandToday()} defaultValue={request.suggestions[0]?.appointmentDate ?? request.preferredDate ?? ''} required /></label>
            <label>{t.startTime}<input name="startTime" type="time" defaultValue={request.suggestions[0]?.startTime ?? '09:00'} required /></label>
            <button className="admin-approve-button" type="submit">{t.propose}</button>
          </form>
        </>}
      </article>)}</div>}
    </div>
  </section>
}

export function ClientScheduleResponse({ requestId, proposalDate, startTime, endTime, status, locale }: {
  requestId: string
  proposalDate: string
  startTime: string
  endTime: string
  status: 'proposed' | 'client_accepted' | 'approved' | 'declined' | 'cancelled'
  locale: Locale
}) {
  const t = schedulingCopy(locale)
  const date = new Intl.DateTimeFormat(`${locale}-CH`, { dateStyle: 'medium' }).format(new Date(`${proposalDate}T12:00:00`))
  return <div className="client-schedule-response">
    <p><strong>{t.clientProposal}:</strong> {date} · {startTime.slice(0, 5)}–{endTime.slice(0, 5)}</p>
    {status === 'proposed' ? <div className="client-schedule-actions">
      <form action={respondToScheduleProposal.bind(null, requestId, 'accept')}><button className="admin-approve-button" type="submit">{t.accept}</button></form>
      <form action={respondToScheduleProposal.bind(null, requestId, 'decline')}><button className="admin-reject-button" type="submit">{t.decline}</button></form>
    </div> : <small>{status === 'client_accepted' ? t.awaitingAdmin : status === 'approved' ? t.approved : status === 'declined' ? t.declined : t.awaitingClient}</small>}
  </div>
}

export function ClientScheduleAction({ requestId, proposalDate, startTime, endTime, proposalStatus, locale }: {
  requestId: string
  proposalDate: string | null
  startTime: string | null
  endTime: string | null
  proposalStatus: 'proposed' | 'client_accepted' | 'approved' | 'declined' | 'cancelled' | null
  locale: Locale
}) {
  if (!proposalDate || !startTime || !endTime || !proposalStatus) return null
  return <ClientScheduleResponse requestId={requestId} proposalDate={proposalDate} startTime={startTime} endTime={endTime} status={proposalStatus} locale={locale} />
}

export function ServiceScheduleCard({ slot }: { slot: SuggestedScheduleSlot }) {
  return <span>{slot.appointmentDate} {slot.startTime}–{slot.endTime}</span>
}

export function StaffAvailabilityStatus() {
  return <Check aria-hidden="true" />
}

export function SuggestedSlotList({ suggestions }: { suggestions: SuggestedScheduleSlot[] }) {
  return <div>{suggestions.map((slot) => <span key={`${slot.appointmentDate}-${slot.startTime}`}>{slot.appointmentDate} · {slot.startTime}</span>)}</div>
}

export function ScheduleTimeDisplay({ proposal }: { proposal: { appointmentDate: string; startTime: string; endTime: string } }) {
  return <time dateTime={`${proposal.appointmentDate}T${proposal.startTime}`}>{proposal.appointmentDate} · {proposal.startTime.slice(0, 5)}–{proposal.endTime.slice(0, 5)}</time>
}
