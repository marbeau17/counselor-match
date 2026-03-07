export type UserRole = 'admin' | 'counselor' | 'client'

export type CounselorLevel = 'starter' | 'regular' | 'senior' | 'master'

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'

export type SessionType = 'online' | 'chat' | 'phone'

export interface Profile {
  id: string
  email: string
  full_name: string
  display_name: string | null
  avatar_url: string | null
  role: UserRole
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Counselor {
  id: string
  user_id: string
  level: CounselorLevel
  title: string
  bio: string
  specialties: string[]
  certifications: string[]
  hourly_rate: number
  is_active: boolean
  rating_average: number
  rating_count: number
  session_count: number
  personality_type: string | null
  methodology: string[]
  available_session_types: SessionType[]
  stripe_account_id: string | null
  commission_rate: number
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  client_id: string
  counselor_id: string
  session_type: SessionType
  status: BookingStatus
  scheduled_at: string
  duration_minutes: number
  price: number
  notes: string | null
  meeting_url: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  booking_id: string
  client_id: string
  counselor_id: string
  amount: number
  platform_fee: number
  counselor_payout: number
  currency: string
  status: PaymentStatus
  stripe_payment_intent_id: string | null
  stripe_transfer_id: string | null
  created_at: string
}

export interface Review {
  id: string
  booking_id: string
  client_id: string
  counselor_id: string
  rating: number
  comment: string | null
  is_anonymous: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sort_order: number
}
