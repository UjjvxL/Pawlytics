import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRiskScore } from '../src/lib/riskEngine.js';
import { canTransitionReport, scorePotentialDuplicate, calculateReporterTrust } from '../src/lib/reportLifecycle.js';

const report = (overrides = {}) => ({
  id: crypto.randomUUID(),
  category: 'chase', severity_level: 3,
  latitude: 28.463, longitude: 77.492,
  incident_timestamp: new Date().toISOString(),
  status: 'verified', verification_status: 'verified',
  trust_weight: 1, dog_count: 1, context_tags: [],
  ...overrides,
});

test('report lifecycle accepts only forward workflow transitions', () => {
  assert.equal(canTransitionReport('submitted', 'pending_verification'), true);
  assert.equal(canTransitionReport('pending_verification', 'verified'), true);
  assert.equal(canTransitionReport('verified', 'assigned'), true);
  assert.equal(canTransitionReport('assigned', 'resolved'), true);
  assert.equal(canTransitionReport('resolved', 'verified'), false);
});

test('risk decays with age and resolved incidents contribute less', () => {
  const fresh = calculateRiskScore([report()]);
  const old = calculateRiskScore([report({ incident_timestamp: new Date(Date.now() - 20 * 86_400_000).toISOString() })]);
  const resolved = calculateRiskScore([report({ status: 'resolved' })]);
  assert.ok(fresh.score > old.score);
  assert.ok(fresh.score > resolved.score);
  assert.equal(calculateRiskScore([report({ status: 'expired' })]).score, 0);
});

test('duplicate signal requires temporal and geographic proximity', () => {
  const original = report({ description: 'four dogs chased a rider near the school gate' });
  const nearby = report({ description: 'four dogs chased a rider at the school gate', latitude: 28.4632 });
  const far = report({ latitude: 29.0, longitude: 78.0 });
  assert.ok(scorePotentialDuplicate(nearby, original) >= 0.65);
  assert.equal(scorePotentialDuplicate(far, original), 0);
});

test('reporter reputation is conservative and penalizes false reports', () => {
  assert.equal(calculateReporterTrust(), 0.5);
  assert.ok(calculateReporterTrust({ confirmed: 10, rejected: 0 }) > calculateReporterTrust({ confirmed: 10, falseReports: 3 }));
});
