import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export async function POST(request: NextRequest) {
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'Stripe no está configurado.' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const totalCHF = Number(body.totalCHF)
    const servicioNom = typeof body.servicioNom === 'string' ? body.servicioNom.trim() : ''

    if (!Number.isFinite(totalCHF) || totalCHF <= 0 || totalCHF > 100000 || !servicioNom) {
      return NextResponse.json({ error: 'Datos de pago no válidos.' }, { status: 400 })
    }

    const stripe = new Stripe(stripeSecretKey)
    const amountInCents = Math.round(totalCHF * 100)
    const origin = request.nextUrl.origin

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'twint'],
      line_items: [{
        price_data: {
          currency: 'chf',
          product_data: {
            name: `Service SwissClean Pro : ${servicioNom.slice(0, 120)}`,
            description: 'Nettoyage professionnel réglementé avec garantie de restitution.',
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: origin,
    })

    return NextResponse.json({ id: session.id, url: session.url })
  } catch {
    return NextResponse.json({ error: 'No se pudo iniciar el pago.' }, { status: 500 })
  }
}
