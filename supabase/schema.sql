-- TasaTrust Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ENUMS
-- ============================================

-- Subscription Tiers
CREATE TYPE subscription_tier AS ENUM ('basic', 'essential', 'professional');

-- Service Types  
CREATE TYPE service_type AS ENUM ('one_time', 'recurring', 'both');

-- Service Visibility
CREATE TYPE service_visibility AS ENUM ('pricing_page', 'portal_only', 'both');

-- Order Status
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled', 'refunded');

-- Subscription Status
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'paused');

-- Booking Status
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- ============================================
-- 2. SERVICES (Admin-managed)
-- ============================================

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

-- Service Pricing per Tier
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

-- ============================================
-- 3. MEMBERS (Users)
-- ============================================

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  company_name VARCHAR(255),
  contact_name VARCHAR(255),
  phone VARCHAR(50),
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. SUBSCRIPTIONS
-- ============================================

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

-- Member's Active Services (add-ons)
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

-- ============================================
-- 5. ORDERS
-- ============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  type VARCHAR(50) NOT NULL, -- 'subscription', 'one_time', 'recurring_addon'
  amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. WEBSITE BUILDS
-- ============================================

CREATE TABLE website_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, review, completed
  requirements TEXT,
  domain VARCHAR(255),
  hosted_url VARCHAR(255),
  notes TEXT,
  assigned_to VARCHAR(255),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. MEETING ROOM BOOKINGS
-- ============================================

CREATE TABLE meeting_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  capacity INTEGER,
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE booking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_room_id UUID REFERENCES meeting_rooms(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  UNIQUE(meeting_room_id, date, start_time)
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  booking_slot_id UUID REFERENCES booking_slots(id),
  status booking_status DEFAULT 'pending',
  purpose VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. AUDIT LOG
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  action VARCHAR(100),
  entity_type VARCHAR(100),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Members can only see their own data
CREATE POLICY "Members can view own data" ON members
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all members" ON members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND email = 'admin@tasatrust.com')
  );

-- Similar policies for other tables...

-- ============================================
-- 10. INDEXES
-- ============================================

CREATE INDEX idx_services_tier ON service_pricing(tier);
CREATE INDEX idx_subscriptions_member ON subscriptions(member_id);
CREATE INDEX idx_orders_member ON orders(member_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_bookings_member ON bookings(member_id);
CREATE INDEX idx_bookings_date ON booking_slots(date);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================
-- 11. TRIGGERS
-- ============================================

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 12. SEED DATA
-- ============================================

-- Insert default services
INSERT INTO services (name, description, type, visibility, category) VALUES
('Virtual Office - Basic', 'Business address with mail alerts', 'recurring', 'pricing_page', 'virtual_office'),
('Virtual Office - Essential', 'Business address with mail forwarding and meeting rooms', 'recurring', 'pricing_page', 'virtual_office'),
('Virtual Office - Professional', 'Premium address with meeting rooms and FREE website build', 'recurring', 'pricing_page', 'virtual_office'),
('Logo Design', 'Professional logo design by Herry', 'one_time', 'both', 'branding'),
('Brand Strategy', 'Complete brand strategy consultation', 'one_time', 'both', 'branding'),
('Marketing Package', 'Ongoing marketing support', 'recurring', 'both', 'branding'),
('Website Build', 'Professional website development', 'both', 'both', 'website'),
('SEO Package', 'Search engine optimization', 'recurring', 'both', 'website'),
('Extra Meeting Room Hours', 'Additional meeting room booking', 'recurring', 'portal_only', 'office');

-- Insert meeting rooms
INSERT INTO meeting_rooms (name, capacity, location) VALUES
('Meeting Room A', 4, 'Ngee Ann City'),
('Meeting Room B', 8, 'Ngee Ann City'),
('Conference Room', 20, 'Ngee Ann City');

-- ============================================
-- 13. VIEWS
-- ============================================

-- Member subscription view
CREATE VIEW member_subscription_view AS
SELECT 
  m.id as member_id,
  m.email,
  m.company_name,
  s.tier,
  s.status as subscription_status,
  s.current_period_end,
  CASE 
    WHEN s.tier = 'professional' THEN true 
    ELSE false 
  END as has_free_website,
  COALESCE(
    (SELECT json_agg(json_build_object('service', srv.name, 'one_time', ms.one_time_purchased, 'recurring', ms.recurring_purchased))
     FROM member_services ms
     JOIN services srv ON ms.service_id = srv.id
     WHERE ms.member_id = m.id AND ms.is_active = true),
    '[]'::json
  ) as active_services
FROM members m
LEFT JOIN subscriptions s ON s.member_id = m.id AND s.status = 'active';
