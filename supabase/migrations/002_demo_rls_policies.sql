-- Pawlytics: RLS policy additions for demo/anonymous access
-- This supplements 001_initial_pawlytics_schema.sql
-- Run AFTER the initial migration has been applied.

-- Problem: The initial RLS policies require auth.uid() for reports SELECT.
-- Demo mode needs unauthenticated users to view demo data.
-- Solution: Add policies that allow anonymous SELECT on demo data (is_demo = true) for reports.

-- Allow anyone to read demo reports (sanitized public data for demo mode)
CREATE POLICY "Anyone can view demo reports"
  ON public.reports FOR SELECT
  USING (is_demo = true);

-- Allow anyone to read demo authority_actions (for demo dashboards)
CREATE POLICY "Anyone can view demo actions"
  ON public.authority_actions FOR SELECT
  USING (is_demo = true);

-- Allow anyone to read demo verifications (for demo dashboards)
CREATE POLICY "Anyone can view demo verifications"
  ON public.verifications FOR SELECT
  USING (is_demo = true);

-- Allow anyone to INSERT reports (anonymous reporting for demo)
-- In production, this would be restricted to authenticated citizens.
CREATE POLICY "Anyone can submit reports for demo"
  ON public.reports FOR INSERT
  WITH CHECK (is_demo = true);

-- Allow anyone to INSERT authority_actions for demo
CREATE POLICY "Anyone can create demo actions"
  ON public.authority_actions FOR INSERT
  WITH CHECK (is_demo = true);

-- Allow anyone to UPDATE demo reports (for verification queue demo)
CREATE POLICY "Anyone can update demo reports"
  ON public.reports FOR UPDATE
  USING (is_demo = true);

-- Allow anyone to INSERT demo verifications
CREATE POLICY "Anyone can create demo verifications"
  ON public.verifications FOR INSERT
  WITH CHECK (is_demo = true);

-- Allow anyone to UPDATE demo authority_actions
CREATE POLICY "Anyone can update demo actions"
  ON public.authority_actions FOR UPDATE
  USING (is_demo = true);
