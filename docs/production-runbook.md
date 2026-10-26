# Pawlytics production runbook

This runbook separates protections implemented in the repository from controls that must be enabled in external dashboards. Never paste service-role keys, database passwords, OAuth secrets, or CAPTCHA secrets into Vite variables: every `VITE_*` value is public in the browser bundle.

## Environments and secrets

Create separate Supabase projects for development, staging, and production. Give each Vercel environment its matching `VITE_SUPABASE_URL` and publishable/anon key. Keep Google disabled with the OpenStreetMap defaults in `.env.example`; when a new browser key is available, restrict it by exact production/staging referrers and only the Maps JavaScript and Places APIs before selecting the Google providers.

Rotate any key that has appeared in chat, source control, screenshots, build logs, or public deployments. Rotation means creating the replacement, updating the relevant Vercel environment, redeploying, verifying, then revoking the old credential. The Supabase publishable/anon key is designed to be public, so security must come from RLS; service-role keys must never reach this application.

## Database release

1. Link the CLI to the intended project and verify the project reference.
2. Review `supabase/migrations/20260903094148_production_foundation.sql` in staging.
3. Run `supabase db push` against staging, exercise all roles, then repeat for production.
4. Schedule `private.expire_stale_workflows()` daily with Supabase Cron.
5. Schedule `private.prune_audit_logs(365)` daily. Increase 365 if the organization requires longer retention.
6. Confirm RLS is enabled and the anon role has no direct access to the newly added workflow tables or RPCs.

## Authentication and authorization

Enable CAPTCHA for signup, sign-in, password reset, and OTP in Supabase Auth using a production Turnstile or hCaptcha site. Configure administrative accounts with MFA and verify an `aal2` session before making MFA mandatory in authority policies. Keep public signup roles fixed to `citizen`; promote authority/admin roles only through an audited server-side administrative process. The migration increments `role_version` and revokes active sessions when a role changes.

Use one least-privilege service identity per deployment or maintenance job. Do not share a service-role credential between CI, local development, analytics, and backups. Review authorization and Storage policies after every new function or table.

## Abuse controls

The migration enforces a per-user report limit and records duplicate indicators, confirmations, disputes, reporter trust, and audit events. Add edge/WAF controls at the deployment boundary for per-IP, device, and geographic limits because PostgreSQL cannot reliably see or trust the original browser IP. Use Vercel Firewall/rate limiting or a dedicated Supabase Edge Function before accepting high-risk public writes. Alert on bursts, repeated rejected evidence, coordinated confirmations, unusual geographies, and rapid account creation.

## Evidence and privacy

Evidence is stored in the private `report-evidence` bucket with owner/authority policies, MIME restrictions, and a 10 MiB limit. The UI obtains short-lived signed URLs instead of public URLs. Do not store precise movement trails in analytics. Periodically verify that deleted reports have the expected evidence-retention behavior and that signed links expire.

## Backups and recovery

Enable Supabase automated backups/PITR appropriate to the production plan. At least quarterly, restore the latest backup into an isolated project and document recovery-point and recovery-time results. Export Storage objects separately if the database backup does not include them. Keep a written owner, escalation contact, incident channel, and restoration order: Auth configuration, schema/migrations, database data, Storage evidence, deployment variables, frontend deployment.

## Monitoring, budgets, and testing

Enable Vercel and Supabase usage/budget alerts before production traffic. Alert at 50%, 75%, 90%, and 100% of the chosen monthly limits, and set hard quotas where possible. Retain application/audit logs for the approved policy period with access restricted to authorities.

The GitHub workflow runs tests, lint, type checking, production compilation, dependency auditing, and Gitleaks. Protect `main` so it requires that workflow. Run an authenticated penetration test in staging before public launch and after material auth/storage changes; cover role escalation, RLS bypass, IDOR, evidence uploads, signed URLs, rate limits, offline replay, CSP, XSS, and session revocation. Do not test third-party or production infrastructure without written authorization.

## Release checklist

- Apply and verify the migration in staging.
- Test citizen, verifier, field-team, authority, and admin accounts.
- Confirm normal `/` contains no demo records and `/demo` retains demo behavior.
- Exercise offline report replay and idempotency.
- Verify signed evidence access and expiry.
- Verify role change signs the affected user out.
- Confirm CSP in the browser console and all required map/network origins.
- Restore a backup in an isolated environment.
- Confirm alert recipients, budgets, quotas, and audit retention.
- Promote the same commit and migration set to production.
