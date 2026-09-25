export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
}

export const PRODUCTS: Product[] = [
  {
    id: 'cleaning-intervention',
    name: 'H&S Quality Service — Intervention',
    description: 'Cleaning intervention for H&S Quality Service (Genève)',
    priceInCents: 268148,
  },
]

export function getProduct(id: string) {
  return PRODUCTS.find((product) => product.id === id)
}

export const SWISS_VAT_RATE = 0.081
export const COMPANY_DETAILS = 'H&S Quality Service (Genève) · CHE-112.884.309 TVA'
     
