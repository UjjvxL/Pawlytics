-- Pawlytics: Demo Data Seed
-- Run AFTER both migrations (001 + 002) have been applied.
-- This populates the database with realistic demo data for the SIH 2026 pilot.

-- ============================================
-- WARDS
-- ============================================
INSERT INTO public.wards (name, ward_number, city, center_lat, center_lng, risk_score, risk_level, confidence, report_count, verified_report_count, bite_count, active_hotspot_count, explanation, is_demo)
VALUES
  ('Sector 62 Noida', 'S62', 'Noida', 28.6260, 77.3620, 72, 'high', 'moderate', 18, 12, 3, 2, 'High verified report density near IT corridor waste zones. Group presence reported frequently.', true),
  ('Sector 18 Atta Market', 'S18', 'Noida', 28.5710, 77.3260, 58, 'elevated', 'moderate', 14, 9, 2, 1, 'Elevated conflict near market waste disposal areas. Evening-peak pattern observed.', true),
  ('Sector 37 Noida', 'S37', 'Noida', 28.5840, 77.3540, 45, 'moderate', 'low', 8, 5, 1, 0, 'Moderate activity near community market. Insufficient verified data for high confidence.', true),
  ('Sector 50 Noida', 'S50', 'Noida', 28.5730, 77.3895, 35, 'moderate', 'low', 6, 3, 0, 0, 'Low-moderate with sparse data. Residential area with occasional sighting reports.', true),
  ('Sector 93 Noida', 'S93', 'Noida', 28.4980, 77.3980, 20, 'low', 'insufficient', 3, 1, 0, 0, 'Insufficient data for reliable assessment. New development area.', true),
  ('Sector 12 Noida', 'S12', 'Noida', 28.5800, 77.3300, 52, 'elevated', 'low', 10, 6, 1, 1, 'Elevated near community market and open drain. Morning-peak pattern.', true);

-- ============================================
-- HOTSPOTS
-- ============================================
INSERT INTO public.hotspots (name, center_lat, center_lng, radius_meters, risk_score, risk_level, confidence, report_count, verified_report_count, dominant_incident_type, severity_distribution, time_pattern, group_presence_count, nearby_factors, time_window_days, ward, explanation, is_active, is_demo)
VALUES
  ('IT Corridor Waste Zone', 28.6255, 77.3615, 250, 78, 'high', 'moderate', 12, 8, 'chase', '{"1": 2, "2": 3, "3": 4, "4": 2, "5": 1}', 'Peak incidents 7–9 PM near waste collection points', 6, ARRAY['waste_site', 'near_road', 'group_presence'], 30, 'Sector 62 Noida', 'High density of verified chase and aggressive interaction reports. Clustered near IT park waste disposal areas with consistent evening-peak temporal pattern. Group presence detected in 50% of reports.', true, true),
  ('Atta Market Perimeter', 28.5715, 77.3255, 200, 62, 'elevated', 'moderate', 9, 6, 'approach_followed', '{"1": 1, "2": 3, "3": 3, "4": 1, "5": 1}', 'Peak 6–10 PM near market closing hours', 4, ARRAY['near_waste', 'near_road'], 30, 'Sector 18 Atta Market', 'Elevated cluster near market waste areas. Most incidents occur during market closing when food waste is discarded. Approach/followed is the dominant interaction type.', true, true),
  ('Sector 62 Park Zone', 28.6280, 77.3640, 180, 55, 'elevated', 'low', 6, 4, 'sighting', '{"1": 3, "2": 2, "3": 1, "4": 0, "5": 0}', 'Morning 6–8 AM jogger encounters', 3, ARRAY['near_park', 'group_presence'], 30, 'Sector 62 Noida', 'Moderate cluster near park area. Mostly sighting and approach reports from morning joggers. Lower severity but consistent group presence.', true, true),
  ('Sector 12 Drain Corridor', 28.5805, 77.3310, 200, 50, 'moderate', 'low', 5, 3, 'chase', '{"1": 1, "2": 1, "3": 2, "4": 1, "5": 0}', 'Late evening 8–11 PM', 2, ARRAY['near_waste', 'near_road'], 30, 'Sector 12 Noida', 'Moderate cluster along open drain corridor. Chase incidents reported in late evening. Waste accumulation likely contributing factor.', true, true);

-- ============================================
-- REPORTS (Demo data — 25 reports)
-- ============================================
INSERT INTO public.reports (category, severity_level, description, latitude, longitude, location_label, ward, incident_timestamp, status, verification_status, evidence_url, dog_count, group_detected, context_tags, cv_dog_count, cv_confidence, cv_group_detected, cv_status, moderator_notes, is_demo, trust_weight)
VALUES
  -- Sector 62 reports
  ('chase', 3, 'Pack of 4 dogs chased me while cycling near IT park entrance. Had to stop and wait for them to leave.', 28.6258, 77.3618, 'Sector 62 Noida', 'Sector 62 Noida', NOW() - INTERVAL '2 days', 'verified', 'verified', 'demo_upload_simulated', 4, true, ARRAY['group_presence', 'near_road', 'evening'], 4, 0.89, true, 'processed', 'Verified — consistent with pattern in area', true, 1.0),
  ('aggressive_interaction', 4, 'Two dogs growling and lunging near office waste bins. One snapped at a pedestrian.', 28.6252, 77.3612, 'Sector 62 Noida', 'Sector 62 Noida', NOW() - INTERVAL '3 days', 'verified', 'verified', 'demo_upload_simulated', 2, true, ARRAY['group_presence', 'near_waste', 'evening'], 2, 0.92, false, 'processed', 'Verified — near known waste hotspot', true, 1.0),
  ('contact_bite', 5, 'Dog bit my ankle while walking home from office. Wound required ARV treatment at district hospital.', 28.6265, 77.3625, 'Sector 62 Noida', 'Sector 62 Noida', NOW() - INTERVAL '5 days', 'verified', 'verified', NULL, 1, false, ARRAY['near_road', 'night'], NULL, NULL, NULL, 'no_image', 'Verified — ARV treatment confirmed via hospital record', true, 1.0),
  ('sighting', 1, 'Group of 5 dogs resting near park entrance. Did not interact but blocking pathway.', 28.6278, 77.3638, 'Sector 62 Noida', 'Sector 62 Noida', NOW() - INTERVAL '1 day', 'verified', 'verified', 'demo_upload_simulated', 5, true, ARRAY['group_presence', 'near_park', 'morning'], 5, 0.95, true, 'processed', NULL, true, 0.7),
  ('approach_followed', 2, 'Dog followed me for about 200 meters while jogging in park. Stopped when I left the area.', 28.6282, 77.3642, 'Sector 62 Noida', 'Sector 62 Noida', NOW() - INTERVAL '4 days', 'verified', 'verified', NULL, 1, false, ARRAY['near_park', 'morning'], NULL, NULL, NULL, 'no_image', NULL, true, 0.7),
  ('chase', 3, 'Dogs chased delivery rider near sector 62 main road crossing.', 28.6245, 77.3608, 'Sector 62 Noida', 'Sector 62 Noida', NOW() - INTERVAL '6 days', 'verified', 'verified', 'demo_upload_simulated', 3, true, ARRAY['group_presence', 'near_road', 'afternoon'], 3, 0.85, true, 'processed', 'Verified', true, 1.0),
  ('sighting', 1, 'Multiple dogs near garbage collection point.', 28.6250, 77.3600, 'Sector 62 Noida', 'Sector 62 Noida', NOW() - INTERVAL '7 days', 'under_review', 'pending', NULL, 3, true, ARRAY['group_presence', 'near_waste', 'evening'], NULL, NULL, NULL, 'no_image', NULL, true, 0.7),
  ('aggressive_interaction', 4, 'Dog barking aggressively at children near school gate.', 28.6270, 77.3630, 'Sector 62 Noida', 'Sector 62 Noida', NOW() - INTERVAL '8 days', 'under_review', 'pending', 'demo_upload_simulated', 1, false, ARRAY['near_school', 'afternoon'], 1, 0.78, false, 'processed', NULL, true, 0.7),

  -- Sector 18 reports
  ('approach_followed', 2, 'Pack of dogs approached me near Atta Market fruit vendors. Had to retreat.', 28.5712, 77.3258, 'Sector 18 Atta Market', 'Sector 18 Atta Market', NOW() - INTERVAL '2 days', 'verified', 'verified', 'demo_upload_simulated', 3, true, ARRAY['group_presence', 'near_waste', 'evening'], 3, 0.88, true, 'processed', 'Verified — market closing pattern', true, 1.0),
  ('chase', 3, 'Chased by dogs near market waste disposal area while on evening walk.', 28.5718, 77.3252, 'Sector 18 Atta Market', 'Sector 18 Atta Market', NOW() - INTERVAL '4 days', 'verified', 'verified', NULL, 2, true, ARRAY['group_presence', 'near_waste', 'evening'], NULL, NULL, NULL, 'no_image', 'Verified', true, 1.0),
  ('contact_bite', 5, 'Stray dog bit a street vendor near Atta Market entrance.', 28.5708, 77.3262, 'Sector 18 Atta Market', 'Sector 18 Atta Market', NOW() - INTERVAL '10 days', 'verified', 'verified', 'demo_upload_simulated', 1, false, ARRAY['near_road', 'afternoon'], 1, 0.91, false, 'processed', 'Verified — bite confirmed', true, 1.0),
  ('sighting', 1, 'Large group of dogs near closed market stalls at night.', 28.5705, 77.3248, 'Sector 18 Atta Market', 'Sector 18 Atta Market', NOW() - INTERVAL '3 days', 'verified', 'verified', NULL, 6, true, ARRAY['group_presence', 'near_waste', 'night'], NULL, NULL, NULL, 'no_image', NULL, true, 0.7),
  ('aggressive_interaction', 4, 'Dog lunged at cyclist near market parking area.', 28.5720, 77.3265, 'Sector 18 Atta Market', 'Sector 18 Atta Market', NOW() - INTERVAL '6 days', 'under_review', 'pending', NULL, 1, false, ARRAY['near_road', 'evening'], NULL, NULL, NULL, 'no_image', NULL, true, 0.7),

  -- Sector 37 reports
  ('sighting', 1, 'Dogs resting on road divider near community market.', 28.5842, 77.3538, 'Sector 37 Noida', 'Sector 37 Noida', NOW() - INTERVAL '5 days', 'verified', 'verified', NULL, 2, false, ARRAY['near_road', 'afternoon'], NULL, NULL, NULL, 'no_image', NULL, true, 0.7),
  ('approach_followed', 2, 'Dog followed my child to school gate.', 28.5838, 77.3542, 'Sector 37 Noida', 'Sector 37 Noida', NOW() - INTERVAL '7 days', 'verified', 'verified', 'demo_upload_simulated', 1, false, ARRAY['near_school', 'morning'], 1, 0.82, false, 'processed', 'Verified — near school zone', true, 1.0),
  ('chase', 3, 'Dogs chased scooter rider near sector 37 main crossing.', 28.5845, 77.3535, 'Sector 37 Noida', 'Sector 37 Noida', NOW() - INTERVAL '9 days', 'verified', 'verified', NULL, 2, true, ARRAY['group_presence', 'near_road', 'evening'], NULL, NULL, NULL, 'no_image', 'Verified', true, 1.0),
  ('contact_bite', 5, 'My dog was bitten by a stray near the park.', 28.5835, 77.3545, 'Sector 37 Noida', 'Sector 37 Noida', NOW() - INTERVAL '12 days', 'verified', 'verified', NULL, 1, false, ARRAY['near_park', 'morning'], NULL, NULL, NULL, 'no_image', 'Verified — animal-to-animal bite', true, 0.7),

  -- Sector 50 reports
  ('sighting', 1, 'Dogs seen near apartment complex waste bins regularly.', 28.5732, 77.3898, 'Sector 50 Noida', 'Sector 50 Noida', NOW() - INTERVAL '4 days', 'verified', 'verified', NULL, 3, true, ARRAY['group_presence', 'near_waste', 'night'], NULL, NULL, NULL, 'no_image', NULL, true, 0.7),
  ('approach_followed', 2, 'Dog approached while I was walking my pet.', 28.5728, 77.3892, 'Sector 50 Noida', 'Sector 50 Noida', NOW() - INTERVAL '8 days', 'verified', 'verified', NULL, 1, false, ARRAY['evening'], NULL, NULL, NULL, 'no_image', NULL, true, 0.7),

  -- Sector 93 reports
  ('sighting', 1, 'Stray dogs near construction site.', 28.4982, 77.3978, 'Sector 93 Noida', 'Sector 93 Noida', NOW() - INTERVAL '10 days', 'under_review', 'pending', NULL, 2, false, ARRAY['morning'], NULL, NULL, NULL, 'no_image', NULL, true, 0.7),

  -- Sector 12 reports
  ('chase', 3, 'Dogs chased me near the drain area while walking home.', 28.5802, 77.3305, 'Sector 12 Noida', 'Sector 12 Noida', NOW() - INTERVAL '3 days', 'verified', 'verified', 'demo_upload_simulated', 2, true, ARRAY['group_presence', 'near_waste', 'night'], 2, 0.87, true, 'processed', 'Verified', true, 1.0),
  ('approach_followed', 2, 'Dog followed me near community market at dawn.', 28.5798, 77.3298, 'Sector 12 Noida', 'Sector 12 Noida', NOW() - INTERVAL '5 days', 'verified', 'verified', NULL, 1, false, ARRAY['morning'], NULL, NULL, NULL, 'no_image', NULL, true, 0.7),
  ('aggressive_interaction', 4, 'Dog growled at passersby near drain overpass.', 28.5808, 77.3312, 'Sector 12 Noida', 'Sector 12 Noida', NOW() - INTERVAL '6 days', 'under_review', 'pending', NULL, 1, false, ARRAY['near_road', 'evening'], NULL, NULL, NULL, 'no_image', NULL, true, 0.7),
  ('contact_bite', 5, 'Child scratched by dog near playground.', 28.5795, 77.3295, 'Sector 12 Noida', 'Sector 12 Noida', NOW() - INTERVAL '14 days', 'verified', 'verified', NULL, 1, false, ARRAY['near_park', 'afternoon'], NULL, NULL, NULL, 'no_image', 'Verified — scratch injury reported', true, 1.0),
  ('sighting', 1, 'Several dogs near open drain at night.', 28.5810, 77.3315, 'Sector 12 Noida', 'Sector 12 Noida', NOW() - INTERVAL '2 days', 'verified', 'verified', NULL, 4, true, ARRAY['group_presence', 'near_waste', 'night'], NULL, NULL, NULL, 'no_image', NULL, true, 0.7);

-- ============================================
-- CONTEXT POIs
-- ============================================
INSERT INTO public.context_pois (name, poi_type, latitude, longitude, ward, city, notes, is_demo)
VALUES
  ('Sector 62 IT Park', 'waste_site', 28.6250, 77.3610, 'Sector 62 Noida', 'Noida', 'Major waste collection point near IT offices', true),
  ('Sector 62 Central Park', 'park', 28.6280, 77.3640, 'Sector 62 Noida', 'Noida', 'Public park with jogging track', true),
  ('Amity International School', 'school', 28.6270, 77.3630, 'Sector 62 Noida', 'Noida', 'K-12 school with large campus', true),
  ('Fortis Hospital Noida', 'hospital', 28.5850, 77.3580, 'Sector 37 Noida', 'Noida', 'Multi-specialty hospital with ARV facility', true),
  ('District ARV Center', 'arv_facility', 28.5720, 77.3270, 'Sector 18 Atta Market', 'Noida', 'Government anti-rabies vaccine center', true),
  ('Atta Market Waste Point', 'waste_site', 28.5708, 77.3248, 'Sector 18 Atta Market', 'Noida', 'Market waste collection and transfer station', true),
  ('Sector 50 Community Park', 'park', 28.5735, 77.3900, 'Sector 50 Noida', 'Noida', 'Neighborhood park with walking path', true),
  ('Sector 12 Community Feeding Zone', 'feeding_zone', 28.5800, 77.3300, 'Sector 12 Noida', 'Noida', 'Registered community dog feeding site', true),
  ('Sector 62 Feeding Zone', 'feeding_zone', 28.6255, 77.3620, 'Sector 62 Noida', 'Noida', 'IT park area feeding zone (informal)', true);

-- ============================================
-- AUTHORITY ACTIONS
-- ============================================
INSERT INTO public.authority_actions (authority_name, action_type, note, status, location_label, is_demo, completed_at)
VALUES
  ('Dr. Anil Kumar — Noida Authority', 'field_inspection_scheduled', 'Scheduled field inspection of IT corridor waste zone following 8 verified reports in 30-day window. Priority: assess waste management infrastructure and dog population density.', 'in_progress', 'Sector 62 Noida', true, NULL),
  ('Municipal Health Dept — Noida', 'abc_team_notified', 'ABC (Animal Birth Control) team notified about concentrated pack presence near Sector 62 IT Park. Request for sterilization survey.', 'pending', 'Sector 62 Noida', true, NULL),
  ('Ward Sanitation Officer — S18', 'waste_issue_reported', 'Reported late-evening waste overflow at Atta Market disposal point as contributing factor to dog congregation. SWM team notified for revised collection schedule.', 'completed', 'Sector 18 Atta Market', true, NOW() - INTERVAL '3 days'),
  ('Dr. Priya Sharma — District Health', 'public_warning_issued', 'Public advisory issued for Sector 62 IT corridor area: avoid walking alone near waste collection points after 7 PM. ARV facility locations shared.', 'completed', 'Sector 62 Noida', true, NOW() - INTERVAL '5 days'),
  ('Community Welfare Officer', 'feeding_zone_review', 'Review of informal feeding zone near IT Park. Engaging community feeders for responsible feeding practices and spatial management.', 'pending', 'Sector 62 Noida', true, NULL),
  ('Ward Officer — Sector 12', 'area_inspection_completed', 'Completed inspection of drain corridor area. Recommended improved waste bin placement and drainage cover repair to reduce dog shelter spots.', 'completed', 'Sector 12 Noida', true, NOW() - INTERVAL '7 days');

-- ============================================
-- ALERTS
-- ============================================
INSERT INTO public.alerts (title, message, alert_type, severity, ward, latitude, longitude, is_active, target_role, is_demo)
VALUES
  ('High Conflict Zone — Sector 62 IT Corridor', 'Elevated conflict activity detected near IT Park waste zone. 8 verified reports in last 30 days including 1 bite incident. Exercise caution in evening hours.', 'hotspot_warning', 'high', 'Sector 62 Noida', 28.6255, 77.3615, true, 'citizen', true),
  ('ARV Advisory — Sector 18', 'Bite incident reported near Atta Market. If you experience any dog bite or scratch, please visit the District ARV Center immediately.', 'health_advisory', 'high', 'Sector 18 Atta Market', 28.5710, 77.3260, true, 'citizen', true),
  ('New Hotspot Detected — Sector 12', 'Spatial clustering analysis has identified a new moderate-risk hotspot near the drain corridor in Sector 12. 3 verified reports within 200m radius.', 'new_hotspot', 'moderate', 'Sector 12 Noida', 28.5805, 77.3310, true, 'authority', true);
