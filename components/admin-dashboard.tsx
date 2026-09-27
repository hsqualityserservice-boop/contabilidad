'use client'

import { type User } from 'better-auth'
import { useState, FormEvent } from 'react'
import { authClient } from '@/lib/auth-client'
import { LogIn, Users, Calendar, FileText } from 'lucide-react'
import '../styles/admin-dashboard.css'

interface AdminDashboardProps {
  user: User
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'clients' | 'personnel' | 'planning' | 'invoices'>('clients')
  const [uniqueCode, setUniqueCode] = useState('')
  const [codeGenerated, setCodeGenerated] = useState(false)
  const [staffMembers] = useState([
    { id: 1, name: 'Maria Gonzalez', email: 'maria@hs-service.ch', status: 'Actif' },
    { id: 2, name: 'Jean Dubois', email: 'jean@hs-service.ch', status: 'En congé' },
  ])
  const [clockRecords] = useState([
    { id: 1, staff: 'Maria Gonzalez', date: '2026-09-27', clockIn: '08:15', clockOut: '17:30', photos: 2 },
  ])
  const [clients] = useState([
    { name: 'Alpine Offices', vat: 'CHE-214.582.901 TVA', address: 'Genève · Suisse', invoice: 'HS-2026-0048' },
    { name: 'Léman Résidences', vat: 'CHE-391.774.205 TVA', address: 'Vaud · Suisse', invoice: 'HS-2026-0047' },
  ])
  const [invoices] = useState([
    { id: 'HS-2026-0048', client: 'Clinique Medicale', amount: 324, status: 'Payée', qrCode: 'QR-0048' },
    { id: 'HS-2026-0047', client: 'Restaurant Brasserie', amount: 487, status: 'En attente', qrCode: 'QR-0047' },
  ])

  const generateCode = (e: FormEvent) => {
    e.preventDefault()
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setUniqueCode(code)
    setCodeGenerated(true)
  }

  const signOut = async () => {
    await authClient.signOut()
    window.location.href = '/'
  }

  return (
    <main className="admin-portal">
      <header className="admin-header">
        <div className="admin-brand">
          <img src="/hs-logo.png" alt="H&S Quality Service" />
          <div>
            <strong>H&S Quality Service</strong>
            <span>Panneau d&apos;administration</span>
          </div>
        </div>
        <div className="header-actions">
          <select aria-label="Langue" defaultValue="FR">
            <option>FR</option>
            <option>ES</option>
            <option>EN</option>
          </select>
          <button className="logout-btn" onClick={signOut} title="Déconnexion">
            <LogIn /> Déconnexion
          </button>
        </div>
      </header>

      <nav className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          <Users /> Base de clients
        </button>
        <button
          className={`tab-btn ${activeTab === 'personnel' ? 'active' : ''}`}
          onClick={() => setActiveTab('personnel')}
        >
          <Users /> Personnel
        </button>
        <button
          className={`tab-btn ${activeTab === 'planning' ? 'active' : ''}`}
          onClick={() => setActiveTab('planning')}
        >
          <Calendar /> Planning terrain
        </button>
        <button
          className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          <FileText /> Factures QR
        </button>
      </nav>

      <section className="admin-content">
        {activeTab === 'clients' && (
          <div className="tab-panel">
            <h2>Base de clients</h2>
            <p className="subtitle">Entreprises suisses et factures QR associées.</p>
            <div className="invoices-list">
              <table>
                <thead><tr><th>Entreprise</th><th>IDE / TVA</th><th>Adresse</th><th>Facture QR</th></tr></thead>
                <tbody>{clients.map((client) => <tr key={client.name}><td><strong>{client.name}</strong></td><td>{client.vat}</td><td>{client.address}</td><td><code>{client.invoice} · CH39 0026 2262 1458 9201 H</code></td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* Personnel Tab */}
        {activeTab === 'personnel' && (
          <div className="tab-panel">
            <h2>Gestion du Personnel</h2>
            <p className="subtitle">Générez des codes uniques de 6 chiffres pour les collaborateurs.</p>

            <form className="code-generator" onSubmit={generateCode}>
              <button type="submit" className="primary-button">
                Générer Code Unique (6 chiffres)
              </button>
              {codeGenerated && (
                <div className="code-display">
                  <p>Code généré:</p>
                  <strong className="unique-code">{uniqueCode}</strong>
                  <small>Valide pour connexion collaborateur</small>
                </div>
              )}
            </form>

            <div className="staff-list">
              <h3>Collaborateurs actifs</h3>
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {staffMembers.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.email}</td>
                      <td className={`status ${member.status.toLowerCase()}`}>{member.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Planning Tab */}
        {activeTab === 'planning' && (
          <div className="tab-panel">
            <h2>Planning terrain</h2>
            <p className="subtitle">Suivi des heures et photos Avant/Après.</p>

            <div className="clock-records">
              <h3>Registre Clock-In / Clock-Out</h3>
              <table>
                <thead>
                  <tr>
                    <th>Collaborateur</th>
                    <th>Date</th>
                    <th>Arrivée</th>
                    <th>Départ</th>
                    <th>Photos</th>
                  </tr>
                </thead>
                <tbody>
                  {clockRecords.map((record) => (
                    <tr key={record.id}>
                      <td>{record.staff}</td>
                      <td>{record.date}</td>
                      <td>{record.clockIn}</td>
                      <td>{record.clockOut}</td>
                      <td>
                        <span className="photo-badge">{record.photos} fichiers</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="tab-panel">
            <h2>Factures QR</h2>
            <p className="subtitle">Gestion des factures avec Swiss QR-Bill.</p>

            <div className="invoices-list">
              <h3>Factures en cours</h3>
              <table>
                <thead>
                  <tr>
                    <th>Numéro</th>
                    <th>Client</th>
                    <th>Montant CHF</th>
                    <th>Statut</th>
                    <th>QR-Bill</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>
                        <strong>{invoice.id}</strong>
                      </td>
                      <td>{invoice.client}</td>
                      <td>{invoice.amount.toFixed(2)}</td>
                      <td className={`status ${invoice.status.toLowerCase()}`}>{invoice.status}</td>
                      <td>
                        <code>{invoice.qrCode}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
