-- =============================================================================
-- Spiritual Features Migration
-- Adds: wallet, growth stages, LINE integration, referrals, review axes,
--       counselor replies, journal entries, columns, and counselor screening.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Alter counselors
-- -----------------------------------------------------------------------------
ALTER TABLE counselors
  ADD COLUMN IF NOT EXISTS concerns TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS price_per_minute INTEGER,
  ADD COLUMN IF NOT EXISTS availability_mode TEXT NOT NULL DEFAULT 'offline',
  ADD COLUMN IF NOT EXISTS on_demand_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS screening_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS intro_video_url TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'counselors_availability_mode_check'
  ) THEN
    ALTER TABLE counselors
      ADD CONSTRAINT counselors_availability_mode_check
      CHECK (availability_mode IN ('offline','accepting_bookings','machiuke'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'counselors_screening_status_check'
  ) THEN
    ALTER TABLE counselors
      ADD CONSTRAINT counselors_screening_status_check
      CHECK (screening_status IN ('pending','approved','suspended'));
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. Alter profiles
-- -----------------------------------------------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS line_user_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS growth_stage TEXT NOT NULL DEFAULT 'shoshin';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_growth_stage_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_growth_stage_check
      CHECK (growth_stage IN ('shoshin','shinka','musubi'));
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. Wallets
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance_yen INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. Wallet transactions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('topup','session_charge','signup_bonus','referral_bonus','refund')),
  amount_yen INTEGER NOT NULL,
  related_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. Review axes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS review_axes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  axis TEXT NOT NULL CHECK (axis IN ('insight','empathy','practicality','approachability','awareness')),
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  UNIQUE(review_id, axis)
);

-- -----------------------------------------------------------------------------
-- 6. Counselor replies
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS counselor_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL UNIQUE REFERENCES reviews(id) ON DELETE CASCADE,
  counselor_id UUID NOT NULL REFERENCES counselors(id) ON DELETE CASCADE,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. Journal entries
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. Columns
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category TEXT CHECK (category IN ('founder','seo','counselor','testimonial')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 10. Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_counselors_availability_mode ON counselors(availability_mode);
CREATE INDEX IF NOT EXISTS idx_columns_slug ON columns(slug);
CREATE INDEX IF NOT EXISTS idx_columns_published_at ON columns(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_axes_review_id ON review_axes(review_id);

-- -----------------------------------------------------------------------------
-- 11. Updated_at triggers (reuse existing update_updated_at() function)
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS wallets_updated_at ON wallets;
CREATE TRIGGER wallets_updated_at BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS counselor_replies_updated_at ON counselor_replies;
CREATE TRIGGER counselor_replies_updated_at BEFORE UPDATE ON counselor_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS columns_updated_at ON columns;
CREATE TRIGGER columns_updated_at BEFORE UPDATE ON columns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- 9. Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_axes ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselor_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

-- Wallets: owner-read only
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin can manage wallets" ON wallets;
CREATE POLICY "Admin can manage wallets" ON wallets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Wallet transactions: owner-read only
DROP POLICY IF EXISTS "Users can view own wallet transactions" ON wallet_transactions;
CREATE POLICY "Users can view own wallet transactions" ON wallet_transactions
  FOR SELECT USING (
    wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admin can manage wallet transactions" ON wallet_transactions;
CREATE POLICY "Admin can manage wallet transactions" ON wallet_transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Review axes: public read, owner (review author) write
DROP POLICY IF EXISTS "Review axes are viewable by everyone" ON review_axes;
CREATE POLICY "Review axes are viewable by everyone" ON review_axes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Review owners can insert axes" ON review_axes;
CREATE POLICY "Review owners can insert axes" ON review_axes
  FOR INSERT WITH CHECK (
    review_id IN (SELECT id FROM reviews WHERE client_id = auth.uid())
  );

DROP POLICY IF EXISTS "Review owners can update axes" ON review_axes;
CREATE POLICY "Review owners can update axes" ON review_axes
  FOR UPDATE USING (
    review_id IN (SELECT id FROM reviews WHERE client_id = auth.uid())
  );

DROP POLICY IF EXISTS "Review owners can delete axes" ON review_axes;
CREATE POLICY "Review owners can delete axes" ON review_axes
  FOR DELETE USING (
    review_id IN (SELECT id FROM reviews WHERE client_id = auth.uid())
  );

-- Counselor replies: public read, counselor owner write
DROP POLICY IF EXISTS "Counselor replies are viewable by everyone" ON counselor_replies;
CREATE POLICY "Counselor replies are viewable by everyone" ON counselor_replies
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Counselor can insert own reply" ON counselor_replies;
CREATE POLICY "Counselor can insert own reply" ON counselor_replies
  FOR INSERT WITH CHECK (
    counselor_id IN (SELECT id FROM counselors WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Counselor can update own reply" ON counselor_replies;
CREATE POLICY "Counselor can update own reply" ON counselor_replies
  FOR UPDATE USING (
    counselor_id IN (SELECT id FROM counselors WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Counselor can delete own reply" ON counselor_replies;
CREATE POLICY "Counselor can delete own reply" ON counselor_replies
  FOR DELETE USING (
    counselor_id IN (SELECT id FROM counselors WHERE user_id = auth.uid())
  );

-- Journal entries: owner-only
DROP POLICY IF EXISTS "Users can view own journal entries" ON journal_entries;
CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own journal entries" ON journal_entries;
CREATE POLICY "Users can insert own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own journal entries" ON journal_entries;
CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own journal entries" ON journal_entries;
CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING (user_id = auth.uid());

-- Columns: public read (published only), admin write
DROP POLICY IF EXISTS "Published columns are viewable by everyone" ON columns;
CREATE POLICY "Published columns are viewable by everyone" ON columns
  FOR SELECT USING (published_at IS NOT NULL);

DROP POLICY IF EXISTS "Admin can manage columns" ON columns;
CREATE POLICY "Admin can manage columns" ON columns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
