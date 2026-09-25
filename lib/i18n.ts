export type Lang = 'ES' | 'FR' | 'EN'

export const languages: Lang[] = ['FR', 'ES', 'EN']

export type GlobalCopy = {
  inbox: string
  notifications: string
  presenceAlert: string
  aiAssistantMessage: string
  staffManagement: string
  fieldPlanning: string
  qrInvoicesQuotes: string
}

export const globalCopy = {
  FR: { inbox: 'Boîte de réception', notifications: 'Notifications', presenceAlert: 'Rappel 24h avant l’intervention: Veuillez confirmer votre présence.', aiAssistantMessage: 'Message de l’Assistant IA', staffManagement: 'Gestion du Personnel', fieldPlanning: 'Planning terrain', qrInvoicesQuotes: 'Factures QR & Devis' },
  ES: { inbox: 'Bandeja de entrada', notifications: 'Notificaciones', presenceAlert: 'Recordatorio 24h antes de la intervención: Por favor, confirme su asistencia.', aiAssistantMessage: 'Mensaje del Asistente de IA', staffManagement: 'Gestión del Personal', fieldPlanning: 'Planificación de campo', qrInvoicesQuotes: 'Facturas QR y Presupuestos' },
  EN: { inbox: 'Inbox', notifications: 'Notifications', presenceAlert: '24h reminder before intervention: Please confirm your presence.', aiAssistantMessage: 'AI Assistant message', staffManagement: 'Staff Management', fieldPlanning: 'Field Planning', qrInvoicesQuotes: 'QR Invoices & Quotes' },
} satisfies Record<Lang, GlobalCopy>

export type ClientCopy = {
  client: string
  clientTitle: string
  clientSub: string
  interventionDetails: string
  interventionPlaceholder: string
  preferredSchedule: string
  chooseDay: string
  chooseSlot: string
  morning: string
  afternoon: string
  presenceReminder: string
  payment: string
  invoiceDetails: string
  vat: string
  insurance: string
  total: string
  requestQuote: string
  requestSent: string
  assistantTitle: string
  assistantPlaceholder: string
  assistantSend: string
  paymentBreakdown: string
  companyDetails: string
  cardPayment: string
  twintPayment: string
  confirmPresence: string
  presenceConfirmed: string
}

export const copy = {
  ES: {
    client: 'Espacio cliente', clientTitle: 'Solicitar una intervención', clientSub: 'Describe tu necesidad y elige cuándo prefieres que acudamos.', interventionDetails: 'Detalles de la intervención', interventionPlaceholder: 'Describe el trabajo de limpieza que necesitas…', preferredSchedule: 'Calendario y horario preferido', chooseDay: 'Elige un día', chooseSlot: 'Elige una franja horaria', morning: 'Mañana · 08:00–12:00', afternoon: 'Tarde · 13:00–17:00', presenceReminder: 'Confirma tu presencia 24 h antes', payment: 'Proceder al pago', invoiceDetails: 'Detalles de la factura', vat: 'IVA suizo 8,1 %', insurance: 'Garantía Baloise: 5.000.000 CHF', total: 'Total estimado', requestQuote: 'Solicitar presupuesto', requestSent: 'Solicitud preparada', assistantTitle: 'Asistente de limpieza', assistantPlaceholder: 'Pide una propuesta de limpieza…', assistantSend: 'Generar propuesta', paymentBreakdown: 'Desglose fiscal', companyDetails: 'H&S Quality Service (Genève) · CHE-112.884.309 TVA', cardPayment: 'Tarjeta bancaria', twintPayment: 'TWINT', confirmPresence: 'Confirmar mi presencia', presenceConfirmed: 'Presencia confirmada',
  },
  FR: {
    client: 'Espace client', clientTitle: 'Demander une intervention', clientSub: 'Décrivez votre besoin et choisissez le moment qui vous convient.', interventionDetails: "Détails de l'intervention", interventionPlaceholder: 'Décrivez le travail de nettoyage souhaité…', preferredSchedule: 'Calendrier et Horaire Préféré', chooseDay: 'Choisir un jour', chooseSlot: 'Choisir une plage horaire', morning: 'Matin · 08:00–12:00', afternoon: 'Après-midi · 13:00–17:00', presenceReminder: 'Confirmer la présence 24h avant', payment: 'Procéder au paiement', invoiceDetails: 'Détails de la facture', vat: 'TVA suisse de 8,1 %', insurance: 'Garantie Baloise : 5\'000\'000 CHF', total: 'Total estimé', requestQuote: 'Demander un devis', requestSent: 'Demande préparée', assistantTitle: 'Assistant de nettoyage', assistantPlaceholder: 'Demandez une proposition de nettoyage…', assistantSend: 'Générer la proposition', paymentBreakdown: 'Détail fiscal', companyDetails: 'H&S Quality Service (Genève) · CHE-112.884.309 TVA', cardPayment: 'Carte bancaire', twintPayment: 'TWINT', confirmPresence: 'Confirmer ma présence', presenceConfirmed: 'Présence confirmée',
  },
  EN: {
    client: 'Client space', clientTitle: 'Request a service', clientSub: 'Describe your needs and choose your preferred time.', interventionDetails: 'Service details', interventionPlaceholder: 'Describe the cleaning work you need…', preferredSchedule: 'Preferred calendar and schedule', chooseDay: 'Choose a day', chooseSlot: 'Choose a time slot', morning: 'Morning · 08:00–12:00', afternoon: 'Afternoon · 13:00–17:00', presenceReminder: 'Confirm presence 24 hours before', payment: 'Proceed to payment', invoiceDetails: 'Invoice details', vat: 'Swiss VAT 8.1%', insurance: 'Baloise guarantee: CHF 5,000,000', total: 'Estimated total', requestQuote: 'Request a quote', requestSent: 'Request prepared', assistantTitle: 'Cleaning assistant', assistantPlaceholder: 'Ask for a cleaning proposal…', assistantSend: 'Generate proposal', paymentBreakdown: 'Tax breakdown', companyDetails: 'H&S Quality Service (Genève) · CHE-112.884.309 VAT', cardPayment: 'Bank card', twintPayment: 'TWINT', confirmPresence: 'Confirm my presence', presenceConfirmed: 'Presence confirmed',
  },
} satisfies Record<Lang, ClientCopy>

export function getClientCopy(lang: Lang) {
  return copy[lang]
}

export const languageNames: Record<Lang, string> = { FR: 'Français', ES: 'Español', EN: 'English' }

export function languageInstruction(lang: Lang) {
  return lang === 'FR' ? 'Réponds uniquement en français. Les propositions et descriptions de nettoyage doivent être exclusivement en français. N’utilise jamais l’espagnol.' : lang === 'EN' ? 'Respond only in English. Cleaning proposals and descriptions must be exclusively in English.' : 'Responde únicamente en español. Las propuestas y descripciones de limpieza deben estar exclusivamente en español.'
}

export function isLang(value: unknown): value is Lang {
  return value === 'FR' || value === 'ES' || value === 'EN'
}

export default copy

