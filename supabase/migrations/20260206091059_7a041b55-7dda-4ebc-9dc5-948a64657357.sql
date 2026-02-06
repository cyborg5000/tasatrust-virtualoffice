-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE service_type AS ENUM ('one_time', 'recurring', 'both');
CREATE TYPE service_visibility AS ENUM ('pricing_page', 'portal_only', 'both');
CREATE TYPE subscription_tier AS ENUM ('basic', 'essential', 'professional');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'paused');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled', 'refunded');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- 1. Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type service_type NOT NULL DEFAULT 'both',
  visibility service_visibility NOT NULL DEFAULT 'both',
  is_active BOOLEAN DEFAULT true,
  icon VARCHAR(100),
  category VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Service Pricing
CREATE TABLE service_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL,
  is_included BOOLEAN DEFAULT false,
  one_time_price DECIMAL(10,2) DEFAULT 0,
  recurring_price DECIMAL(10,2) DEFAULT 0,
  recurring_interval VARCHAR(50) DEFAULT 'monthly',
  UNIQUE(service_id, tier)
);

-- 3. Members
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  phone VARCHAR(50),
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL,
  status subscription_status DEFAULT 'active',
  stripe_subscription_id VARCHAR(255),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Member Services
CREATE TABLE member_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  tier_at_purchase subscription_tier NOT NULL,
  is_active BOOLEAN DEFAULT true,
  stripe_price_id VARCHAR(255),
  one_time_purchased BOOLEAN DEFAULT false,
  recurring_purchased BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Website Builds
CREATE TABLE website_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  requirements TEXT,
  domain VARCHAR(255),
  assigned_to VARCHAR(255),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Meeting Rooms
CREATE TABLE meeting_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  capacity INTEGER,
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true
);

-- 9. Booking Slots
CREATE TABLE booking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_room_id UUID REFERENCES meeting_rooms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  UNIQUE(meeting_room_id, date, start_time)
);

-- 10. Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  booking_slot_id UUID REFERENCES booking_slots(id) ON DELETE CASCADE,
  status booking_status DEFAULT 'pending',
  purpose VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public read policies for services and pricing (visible on pricing page)
CREATE POLICY "Services are publicly readable" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Service pricing is publicly readable" ON service_pricing FOR SELECT USING (true);
CREATE POLICY "Meeting rooms are publicly readable" ON meeting_rooms FOR SELECT USING (is_active = true);
CREATE POLICY "Booking slots are publicly readable" ON booking_slots FOR SELECT USING (is_available = true);

-- Member-specific policies
CREATE POLICY "Users view own member data" ON members FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own member data" ON members FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own member data" ON members FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users view own subscriptions" ON subscriptions FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "Users view own member services" ON member_services FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "Users view own website builds" ON website_builds FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "Users view own bookings" ON bookings FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (member_id = auth.uid());

-- Seed Meeting Rooms
INSERT INTO meeting_rooms (name, capacity, location, is_active) VALUES
  ('Room A', 4, 'First Floor', true),
  ('Room B', 6, 'First Floor', true),
  ('Conference Room', 12, 'Second Floor', true);

-- Seed Services
INSERT INTO services (name, description, type, visibility, icon, category, display_order) VALUES
  ('Virtual Business Address', 'Professional business address for your company', 'recurring', 'both', 'MapPin', 'core', 1),
  ('Mail Handling', 'Receive and forward business mail', 'recurring', 'both', 'Mail', 'core', 2),
  ('Phone Answering', 'Professional phone answering service', 'recurring', 'both', 'Phone', 'core', 3),
  ('Meeting Room Access', 'Book meeting rooms by the hour', 'both', 'both', 'Users', 'core', 4),
  ('Registered Agent', 'Official registered agent service', 'recurring', 'both', 'Shield', 'legal', 5),
  ('Logo Design', 'Professional logo design service', 'one_time', 'both', 'Palette', 'branding', 6),
  ('Website Build', 'Custom website development', 'one_time', 'both', 'Globe', 'digital', 7),
  ('Business Cards', 'Premium business card printing', 'one_time', 'both', 'CreditCard', 'branding', 8);

-- Seed Service Pricing for each tier
INSERT INTO service_pricing (service_id, tier, is_included, one_time_price, recurring_price)
SELECT s.id, 'basic', 
  CASE WHEN s.name IN ('Virtual Business Address', 'Mail Handling') THEN true ELSE false END,
  CASE WHEN s.type = 'one_time' THEN 299.00 ELSE 0 END,
  CASE WHEN s.name = 'Phone Answering' THEN 29.99 WHEN s.name = 'Meeting Room Access' THEN 25.00 ELSE 0 END
FROM services s;

INSERT INTO service_pricing (service_id, tier, is_included, one_time_price, recurring_price)
SELECT s.id, 'essential', 
  CASE WHEN s.name IN ('Virtual Business Address', 'Mail Handling', 'Phone Answering') THEN true ELSE false END,
  CASE WHEN s.type = 'one_time' THEN 249.00 ELSE 0 END,
  CASE WHEN s.name = 'Meeting Room Access' THEN 20.00 ELSE 0 END
FROM services s;

INSERT INTO service_pricing (service_id, tier, is_included, one_time_price, recurring_price)
SELECT s.id, 'professional', 
  CASE WHEN s.name IN ('Virtual Business Address', 'Mail Handling', 'Phone Answering', 'Meeting Room Access', 'Registered Agent') THEN true ELSE false END,
  CASE WHEN s.type = 'one_time' THEN 199.00 ELSE 0 END,
  0
FROM services s;