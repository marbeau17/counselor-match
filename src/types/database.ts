export type UserRole = 'admin' | 'counselor' | 'client'

export type CounselorLevel = 'starter' | 'regular' | 'senior' | 'master'

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'

export type SessionType = 'online' | 'chat' | 'phone'

export type AvailabilityMode = 'offline' | 'accepting_bookings' | 'machiuke'

export type ScreeningStatus = 'pending' | 'approved' | 'suspended'

export type GrowthStage = 'shoshin' | 'shinka' | 'musubi'

export type WalletTxType = 'topup' | 'session_charge' | 'signup_bonus' | 'referral_bonus' | 'refund'

export type ReviewAxis = 'insight' | 'empathy' | 'practicality' | 'approachability' | 'awareness'

export type ColumnCategory = 'founder' | 'seo' | 'counselor' | 'testimonial'

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
  birth_date?: string | null
  line_user_id?: string | null
  referral_code?: string | null
  referred_by?: string | null
  growth_stage?: GrowthStage
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
  concerns?: string[]
  price_per_minute?: number | null
  availability_mode?: AvailabilityMode
  on_demand_enabled?: boolean
  screening_status?: ScreeningStatus
  intro_video_url?: string | null
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
  axes?: ReviewAxisScore[]
  reply?: CounselorReply | null
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sort_order: number
}

export interface Wallet {
  id: string
  user_id: string
  balance_yen: number
  created_at: string
  updated_at: string
}

export interface WalletTransaction {
  id: string
  wallet_id: string
  type: WalletTxType
  amount_yen: number
  related_booking_id?: string | null
  expires_at?: string | null
  note?: string | null
  created_at: string
}

export interface ReviewAxisScore {
  id: string
  review_id: string
  axis: ReviewAxis
  score: number
}

export interface CounselorReply {
  id: string
  review_id: string
  counselor_id: string
  body: string
  created_at: string
  updated_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  booking_id?: string | null
  body: string
  created_at: string
}

export interface ContentColumn {
  id: string
  slug: string
  title: string
  body: string
  excerpt?: string | null
  author_id?: string | null
  category: ColumnCategory
  published_at?: string | null
  created_at: string
  updated_at: string
}
