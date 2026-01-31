# 🚀 Release Checklist

## 1. 📂 Pre-Deployment
- [ ] **Artifacts**: Ensure `npm run build` succeeds and is pushed to CI.
- [ ] **Migrations**: Run `npm run db:migrate:status` to verify pending migrations.
- [ ] **Secrets**: Verify all production environment variables (DB URLs, JWT keys) are present in the hosting provider.

## 2. 🚢 Deployment
- [ ] **DB Migration**: Execute `npm run db:migrate:deploy` against production.
- [ ] **Service Update**: Deploy the new backend image/frontend bundle.
- [ ] **Health Check**: Hit `/api/v1/health` and verify 200 OK.

## 3. 🧪 Post-Deployment (Smoke)
- [ ] **Smoke Test**: Run `npm run test:smoke` against the production environment.
- [ ] **Metrics**: Check the `/metrics` endpoint to ensure dashboard counters are updating.
- [ ] **Logs**: Tail production logs for unusual 500 error spikes.

## 4. 🚨 Rollback Plan
- [ ] **Trigger**: If `/health` fails or `test:smoke` fails on 3 retries.
- [ ] **App**: Revert to the previous stable Docker image tag/Git hash.
- [ ] **DB**: If a migration broke schema (rarely), apply a "revert-migration" (refer to MIGRATIONS.md).
- [ ] **Verify**: Re-run Smoke Test on the reverted version.

## 📈 Monitoring & Alerts
- [ ] Ensure **Sentry/LogDNA** is receiving events.
- [ ] Verify **UptimeRobot/Signalfx** alerts are active for 5xx errors.
