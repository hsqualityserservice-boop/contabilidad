'use server'

import Stripe from 'stripe'
import { getProduct } from '@/lib/products'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createPaymentSession(productId: string) {
  const product = getProduct(productId)
  if (!product) throw new Error('Producto no disponible')

  const origin = process.env.BETTER_AUTH_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || 'http://localhost:3000'
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    ui_mode: 'hosted_page',
    line_items: [{ price_data: { currency: 'chf', product_data: { name: product.name, description: product.description }, unit_amount: product.priceInCents }, quantity: 1 }],
    success_url: `${origin}/dashboard?payment=success`,
    cancel_url: `${origin}/dashboard?payment=cancelled`,
    billing_address_collection: 'required',
  })
  return session.url
}
      
