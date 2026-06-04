-- User registration and profile management
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin')) DEFAULT 'admin',
  phone TEXT,
  address TEXT,
  nic_number TEXT,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  branch_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Facility management
CREATE TABLE grounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat FLOAT8,
  lng FLOAT8,
  contact_number TEXT NOT NULL,
  ground_type TEXT NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  available_from TEXT NOT NULL, -- HH:mm
  available_to TEXT NOT NULL,   -- HH:mm
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sports offered per ground
CREATE TABLE sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ground_id UUID REFERENCES grounds(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price_per_hour FLOAT8 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking management
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ground_id UUID REFERENCES grounds(id) ON DELETE CASCADE NOT NULL,
  sport_name TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Null for guest bookings
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT NOT NULL,
  guest_nic TEXT,
  date DATE NOT NULL,
  time_slots JSONB NOT NULL, -- Array of objects: [{"startTime": "10:00"}]
  status TEXT NOT NULL CHECK (status IN ('reserved', 'confirmed', 'cancelled')) DEFAULT 'reserved',
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'advanced_paid', 'full_paid')) DEFAULT 'pending',
  payment_group_id TEXT,
  payhere_payment_id TEXT,
  paid_amount FLOAT8 DEFAULT 0,
  total_amount FLOAT8 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger logic
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_grounds_updated_at BEFORE UPDATE ON grounds FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
