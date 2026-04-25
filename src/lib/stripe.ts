import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    })
  }
  return _stripe
}

// STRIPE_SECRET_KEY 未設定時に null を返す安全版（決済を任意機能として扱う）
export function getStripeOptional(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null
  try {
    return getStripe()
  } catch {
    return null
  }
}
