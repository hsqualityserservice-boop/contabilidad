'use client'

import { type User } from 'better-auth'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { LogIn, Clock, Camera } from 'lucide-react'
import '../styles/staff-portal.css'

interface StaffPortalProps {
  user: User
}

export default function StaffPortal({ user }: StaffPortalProps) {
  const [clockedIn, setClockedIn] = useState(false)
  const [clockInTime, setClockInTime] = useState<string | null>(null)
  const [photos, setPhotos] = useState<string[]>([])

  const handleClockIn = () => {
    const now = new Date().toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })
    setClockInTime(now)
    setClockedIn(true)
  }

  const handleClockOut = () => {
    setClockedIn(false)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files) {
      const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file))
      setPhotos([...photos, ...newPhotos])
    }
  }

  const signOut = async () => {
    await authClient.signOut()
    window.location.href = '/'
  }

  return (
    <main className="staff-portal">
      <header className="staff-header">
        <div className="staff-brand">
          <img src="/hs-logo.png" alt="H&S Quality Service" />
          <div>
            <strong>H&S Quality Service</strong>
            <span>Portail Collaborateur</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="logout-btn" onClick={signOut} title="Déconnexion">
            <LogIn /> Déconnexion
          </button>
        </div>
      </header>

      <section className="staff-content">
        <div className="clock-section">
          <h2>Pointage du jour</h2>
          <div className={`clock-card ${clockedIn ? 'active' : ''}`}>
            <Clock className="clock-icon" />
            {clockedIn ? (
              <>
                <p className="status-text">Actuellement présent</p>
                <p className="clock-time">{clockInTime}</p>
                <button className="secondary-button" onClick={handleClockOut}>
                  Pointer la sortie
                </button>
              </>
            ) : (
              <>
                <p className="status-text">Pointage disponible</p>
                <button className="primary-button" onClick={handleClockIn}>
                  Pointer l&apos;entrée
                </button>
              </>
            )}
          </div>
        </div>

        <div className="photos-section">
          <h2>Photos Avant/Après</h2>
          <div className="upload-zone">
            <Camera className="camera-icon" />
            <label className="upload-label">
              <span className="upload-text">Télécharger photos</span>
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} hidden />
            </label>
            <small>Glissez-déposez ou cliquez pour sélectionner</small>
          </div>

          {photos.length > 0 && (
            <div className="photos-grid">
              <h3>Photos uploadées ({photos.length})</h3>
              <div className="photo-list">
                {photos.map((photo, index) => (
                  <div key={index} className="photo-item">
                    <img src={photo} alt={`Photo ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
