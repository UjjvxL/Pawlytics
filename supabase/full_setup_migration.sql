-- ============================================================
-- PAWLYTICS MASTER SUPABASE MIGRATION & SEED SCRIPT
-- Contains: Schema (001), RLS Policies (002), Auto-User Trigger, & Demo Data Seed
-- Execute this entire file in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ytkvkvzqlbkjctnpxqoz/sql/new
-- ============================================================

-- Helper Function for `updated_at` triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Users Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'citizen',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-sync new auth.users to public.users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'role', 'citizen'))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper Function: is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Wards Table
CREATE TABLE IF NOT EXISTS public.wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    ward_number TEXT,
    city TEXT NOT NULL DEFAULT 'Noida',
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    risk_score NUMERIC DEFAULT 0,
    risk_level TEXT DEFAULT 'unknown',
    confidence TEXT DEFAULT 'insufficient',
    report_count INTEGER DEFAULT 0,
    verified_report_count INTEGER DEFAULT 0,
    bite_count INTEGER DEFAULT 0,
    active_hotspot_count INTEGER DEFAULT 0,
    explanation TEXT,
    last_calculated TIMESTAMPTZ,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_wards_updated_at BEFORE UPDATE ON public.wards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Hotspots Table
CREATE TABLE IF NOT EXISTS public.hotspots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    center_lat DOUBLE PRECISION NOT NULL,
    center_lng DOUBLE PRECISION NOT NULL,
    radius_meters NUMERIC DEFAULT 200,
    risk_score NUMERIC,
    risk_level TEXT NOT NULL,
    confidence TEXT,
    report_count INTEGER NOT NULL,
    verified_report_count INTEGER,
    dominant_incident_type TEXT,
    severity_distribution JSONB,
    time_pattern TEXT,
    group_presence_count INTEGER,
    nearby_factors TEXT[],
    time_window_days INTEGER DEFAULT 30,
    ward TEXT,
    explanation TEXT,
    is_active BOOLEAN DEFAULT true,
    is_demo BOOLEAN DEFAULT false,
    last_calculated TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_hotspots_updated_at BEFORE UPDATE ON public.hotspots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reporter_name TEXT,
    category TEXT NOT NULL,
    severity_level INTEGER NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_label TEXT,
    ward TEXT,
    incident_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT DEFAULT 'under_review',
    verification_status TEXT DEFAULT 'pending',
    duplicate_of UUID REFERENCES public.reports(id) ON DELETE SET NULL,
    evidence_url TEXT,
    dog_count INTEGER DEFAULT 1,
    group_detected BOOLEAN DEFAULT false,
    context_tags TEXT[],
    cv_dog_count INTEGER,
    cv_confidence NUMERIC,
    cv_group_detected BOOLEAN,
    cv_status TEXT DEFAULT 'no_image',
    confidence_score NUMERIC,
    moderator_notes TEXT,
    reviewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_demo BOOLEAN DEFAULT false,
    suspicious_flag BOOLEAN DEFAULT false,
    trust_weight NUMERIC DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Authority Actions Table
CREATE TABLE IF NOT EXISTS public.authority_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotspot_id UUID REFERENCES public.hotspots(id) ON DELETE SET NULL,
    ward_id UUID REFERENCES public.wards(id) ON DELETE SET NULL,
    authority_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    authority_name TEXT,
    action_type TEXT NOT NULL,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    location_label TEXT,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_authority_actions_updated_at BEFORE UPDATE ON public.authority_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Context POIs Table
CREATE TABLE IF NOT EXISTS public.context_pois (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    poi_type TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    ward TEXT,
    city TEXT DEFAULT 'Noida',
    notes TEXT,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_context_pois_updated_at BEFORE UPDATE ON public.context_pois FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Verifications Table
CREATE TABLE IF NOT EXISTS public.verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewer_name TEXT,
    decision TEXT NOT NULL,
    reason TEXT,
    notes TEXT,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_verifications_updated_at BEFORE UPDATE ON public.verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    ward TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_active BOOLEAN DEFAULT true,
    target_role TEXT,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON public.alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- INDEXING
CREATE INDEX IF NOT EXISTS idx_reports_is_demo ON public.reports(is_demo);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_verification_status ON public.reports(verification_status);
CREATE INDEX IF NOT EXISTS idx_reports_incident_timestamp ON public.reports(incident_timestamp);
CREATE INDEX IF NOT EXISTS idx_reports_ward ON public.reports(ward);

CREATE INDEX IF NOT EXISTS idx_hotspots_is_demo ON public.hotspots(is_demo);
CREATE INDEX IF NOT EXISTS idx_hotspots_is_active ON public.hotspots(is_active);
CREATE INDEX IF NOT EXISTS idx_hotspots_ward ON public.hotspots(ward);

CREATE INDEX IF NOT EXISTS idx_wards_is_demo ON public.wards(is_demo);

CREATE INDEX IF NOT EXISTS idx_authority_actions_is_demo ON public.authority_actions(is_demo);
CREATE INDEX IF NOT EXISTS idx_alerts_is_demo ON public.alerts(is_demo);

-- RLS POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON public.users FOR SELECT USING (is_admin());

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view demo reports" ON public.reports FOR SELECT USING (is_demo = true);
CREATE POLICY "Citizens create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id OR is_demo = true);
CREATE POLICY "Citizens view own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Admins view all reports" ON public.reports FOR SELECT USING (is_admin());
CREATE POLICY "Admins update reports" ON public.reports FOR UPDATE USING (is_admin() OR is_demo = true);

ALTER TABLE public.hotspots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view hotspots" ON public.hotspots FOR SELECT USING (true);
CREATE POLICY "Admins manage hotspots" ON public.hotspots FOR ALL USING (is_admin());

ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view wards" ON public.wards FOR SELECT USING (true);
CREATE POLICY "Admins manage wards" ON public.wards FOR ALL USING (is_admin());

ALTER TABLE public.authority_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view demo actions" ON public.authority_actions FOR SELECT USING (is_demo = true);
CREATE POLICY "Admins manage actions" ON public.authority_actions FOR ALL USING (is_admin());

ALTER TABLE public.context_pois ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view POIs" ON public.context_pois FOR SELECT USING (true);
CREATE POLICY "Admins manage POIs" ON public.context_pois FOR ALL USING (is_admin());

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view demo verifications" ON public.verifications FOR SELECT USING (is_demo = true);
CREATE POLICY "Admins manage verifications" ON public.verifications FOR ALL USING (is_admin());

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view active alerts" ON public.alerts FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage alerts" ON public.alerts FOR ALL USING (is_admin());

-- SEED DATA (Noida Pilot Demo Dataset)
INSERT INTO public.wards (name, ward_number, city, center_lat, center_lng, risk_score, risk_level, confidence, report_count, verified_report_count, bite_count, active_hotspot_count, explanation, is_demo)
VALUES 
('Sector 62 Noida', 'W-62', 'Noida', 28.6270, 77.3725, 78, 'high', 'high', 34, 28, 5, 3, 'High density of reports near tech parks and food stalls. 5 verified bites in last 30 days.', true),
('Sector 18 Atta Market', 'W-18', 'Noida', 28.5708, 77.3261, 65, 'elevated', 'moderate', 22, 18, 2, 2, 'Commercial market zone with high evening footfall.', true),
('Sector 37 Noida', 'W-37', 'Noida', 28.5612, 77.3370, 48, 'moderate', 'moderate', 15, 12, 1, 1, 'Residential area near Golf Course Metro.', true),
('Sector 50 Noida', 'W-50', 'Noida', 28.5762, 77.3639, 32, 'low', 'low', 8, 6, 0, 0, 'Low incident density; active sterilization program underway.', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.hotspots (name, center_lat, center_lng, radius_meters, risk_score, risk_level, confidence, report_count, verified_report_count, dominant_incident_type, time_pattern, group_presence_count, ward, explanation, is_demo)
VALUES
('Sector 62 Metro Station Gate 2', 28.6280, 77.3730, 250, 82, 'high', 'high', 14, 12, 'aggressive_interaction', 'Evening 18:00 - 22:00', 4, 'Sector 62 Noida', 'Concentrated pack of 4-6 dogs near commuter exit.', true),
('Fortis Hospital Perimeter Road', 28.6245, 77.3685, 200, 74, 'high', 'moderate', 10, 8, 'contact_bite', 'Night 21:00 - 02:00', 3, 'Sector 62 Noida', 'Multiple chase and bite reports near waste disposal area.', true),
('Atta Market Central Plaza', 28.5712, 77.3265, 300, 68, 'elevated', 'moderate', 12, 10, 'approach_followed', 'Evening 17:00 - 21:00', 2, 'Sector 18 Atta Market', 'High food waste accumulation attracts packs near eateries.', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.reports (category, severity_level, description, latitude, longitude, location_label, ward, incident_timestamp, status, verification_status, dog_count, group_detected, context_tags, is_demo)
VALUES
('contact_bite', 5, 'Bitten on leg while walking near Gate 2 at 8:30 PM. Pack of 4 dogs.', 28.6282, 77.3732, 'Sector 62 Metro Gate 2', 'Sector 62 Noida', NOW() - INTERVAL '2 days', 'verified', 'verified', 4, true, ARRAY['group_presence', 'near_transit'], true),
('aggressive_interaction', 4, 'Aggressive barking and lunging at two commuters.', 28.6278, 77.3728, 'Sector 62 Metro Gate 2', 'Sector 62 Noida', NOW() - INTERVAL '4 days', 'verified', 'verified', 3, true, ARRAY['group_presence'], true),
('chase', 3, 'Chased two-wheeler rider near hospital back gate.', 28.6246, 77.3687, 'Fortis Hospital Perimeter', 'Sector 62 Noida', NOW() - INTERVAL '5 days', 'verified', 'verified', 2, true, ARRAY['near_road', 'near_waste'], true),
('sighting', 1, 'Group of 3 dogs sleeping near park fence.', 28.5765, 77.3642, 'Sector 50 Block B Park', 'Sector 50 Noida', NOW() - INTERVAL '1 day', 'verified', 'verified', 3, true, ARRAY['near_park'], true),
('contact_bite', 5, 'Minor bite incident reported near food stalls in Atta Market.', 28.5714, 77.3268, 'Atta Market Sector 18', 'Sector 18 Atta Market', NOW() - INTERVAL '6 days', 'verified', 'verified', 2, false, ARRAY['near_waste', 'high_footfall'], true)
ON CONFLICT DO NOTHING;

INSERT INTO public.alerts (title, message, alert_type, severity, ward, latitude, longitude, is_active, target_role, is_demo)
VALUES
('High Conflict Warning — Sector 62 Metro', 'Pack aggression reported between 18:00 - 22:00 near Gate 2. Please use main road route.', 'warning', 'high', 'Sector 62 Noida', 28.6280, 77.3730, true, 'all', true),
('ABC Sterilization Drive — Sector 50', 'Municipal veterinary team conducting ABC drive in Sector 50 this week.', 'info', 'low', 'Sector 50 Noida', 28.5762, 77.3639, true, 'citizen', true)
ON CONFLICT DO NOTHING;
