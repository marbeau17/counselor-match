import { createClient } from '@/lib/supabase/server'
import type { Wallet, WalletTransaction } from '@/types/database'

export const WALLET_TOPUP_DENOMINATIONS = [5000, 10000, 30000] as const
export const SIGNUP_BONUS_YEN = 3000
export const SIGNUP_BONUS_EXPIRY_DAYS = 14
export const REFERRAL_BONUS_YEN = 2000

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export async function getOrCreateWallet(userId: string): Promise<Wallet | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const supabase = await createClient()
    if (!supabase) return null
    const { data: existing, error: selectError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (selectError) {
      console.error('[wallet] select error', selectError)
      return null
    }
    if (existing) return existing as Wallet

    const { data: inserted, error: insertError } = await supabase
      .from('wallets')
      .insert({ user_id: userId, balance_yen: 0 })
      .select('*')
      .single()

    if (insertError) {
      console.error('[wallet] insert error', insertError)
      return null
    }
    return inserted as Wallet
  } catch (err) {
    console.error('[wallet] getOrCreateWallet exception', err)
    return null
  }
}

export async function getWalletBalance(userId: string): Promise<number> {
  const wallet = await getOrCreateWallet(userId)
  if (!wallet) return 0
  return wallet.balance_yen ?? 0
}

export async function listWalletTransactions(
  userId: string,
  limit = 50
): Promise<WalletTransaction[]> {
  if (!isSupabaseConfigured()) return []
  try {
    const wallet = await getOrCreateWallet(userId)
    if (!wallet) return []
    const supabase = await createClient()
    if (!supabase) return []
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[wallet] listWalletTransactions error', error)
      return []
    }
    return (data ?? []) as WalletTransaction[]
  } catch (err) {
    console.error('[wallet] listWalletTransactions exception', err)
    return []
  }
}

export async function issueSignupBonus(
  userId: string
): Promise<WalletTransaction | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const wallet = await getOrCreateWallet(userId)
    if (!wallet) return null
    const supabase = await createClient()
    if (!supabase) return null

    const { data: existing, error: existingError } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('wallet_id', wallet.id)
      .eq('type', 'signup_bonus')
      .maybeSingle()

    if (existingError) {
      console.error('[wallet] signup bonus check error', existingError)
      return null
    }
    if (existing) return null

    const expiresAt = new Date(
      Date.now() + SIGNUP_BONUS_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    ).toISOString()

    const { data: tx, error: insertError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        type: 'signup_bonus',
        amount_yen: SIGNUP_BONUS_YEN,
        expires_at: expiresAt,
        note: 'Signup bonus',
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('[wallet] signup bonus insert error', insertError)
      return null
    }

    const { error: updateError } = await supabase
      .from('wallets')
      .update({ balance_yen: (wallet.balance_yen ?? 0) + SIGNUP_BONUS_YEN })
      .eq('id', wallet.id)

    if (updateError) {
      console.error('[wallet] signup bonus balance update error', updateError)
    }

    return tx as WalletTransaction
  } catch (err) {
    console.error('[wallet] issueSignupBonus exception', err)
    return null
  }
}
