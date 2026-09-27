import { generateText } from 'ai'

export async function POST(request: Request) {
  const { message, language = 'FR' } = await request.json()
  if (typeof message !== 'string' || message.trim().length < 2) return Response.json({ text: 'Veuillez écrire une question.' }, { status: 400 })
  const result = await generateText({ model: 'anthropic/claude-haiku-4.5', system: `Tu es H&S Assistant pour hs-cleaning.ch. Réponds brièvement et utilement en ${language}. Tu aides avec les services de nettoyage, les régions, les créneaux Matin/Après-midi, la TVA suisse de 8.1% et les devis. Ne promets jamais un prix différent du calculateur et renvoie vers l’entreprise pour toute question contractuelle.`, prompt: message.trim() })
  return Response.json({ text: result.text })
}
