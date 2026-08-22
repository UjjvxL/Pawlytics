-- Pawlytics Phase 1: Supabase Foundation Setup
-- Migration: 001_initial_pawlytics_schema.sql

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
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
    city TEXT NOT NULL DEFAULT 'Bengaluru',
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
    incident_timestamp TIMESTAMPTZ NOT NULL,
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
    city TEXT DEFAULT 'Bengaluru',
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


-- ==============================================
-- INDEXING
-- ==============================================
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
CREATE INDEX IF NOT EXISTS idx_authority_actions_hotspot_id ON public.authority_actions(hotspot_id);
CREATE INDEX IF NOT EXISTS idx_authority_actions_ward_id ON public.authority_actions(ward_id);

CREATE INDEX IF NOT EXISTS idx_alerts_is_demo ON public.alerts(is_demo);
CREATE INDEX IF NOT EXISTS idx_alerts_is_active ON public.alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_ward ON public.alerts(ward);

CREATE INDEX IF NOT EXISTS idx_verifications_report_id ON public.verifications(report_id);


-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON public.users FOR SELECT USING (is_admin());

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Citizens can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Citizens can view own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Admins can view all reports" ON public.reports FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update reports" ON public.reports FOR UPDATE USING (is_admin());
-- NOTE: Intentionally not exposing reports table for public anonymous access per user requirements.

ALTER TABLE public.hotspots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view hotspots" ON public.hotspots FOR SELECT USING (true);
CREATE POLICY "Admins can manage hotspots" ON public.hotspots FOR ALL USING (is_admin());

ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view wards" ON public.wards FOR SELECT USING (true);
CREATE POLICY "Admins can manage wards" ON public.wards FOR ALL USING (is_admin());

ALTER TABLE public.authority_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage actions" ON public.authority_actions FOR ALL USING (is_admin());

ALTER TABLE public.context_pois ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view POIs" ON public.context_pois FOR SELECT USING (true);
CREATE POLICY "Admins can manage POIs" ON public.context_pois FOR ALL USING (is_admin());

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage verifications" ON public.verifications FOR ALL USING (is_admin());

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active alerts" ON public.alerts FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage alerts" ON public.alerts FOR ALL USING (is_admin());
