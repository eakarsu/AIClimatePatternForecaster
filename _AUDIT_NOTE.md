# Audit Note — AIClimatePatternForecaster

Source: `_AUDIT/reports/batch_01.md` (Project 26)

## Maturity: SUBSTANTIVE (21 routes, 15 AI endpoints, deps installed)

## Original audit recommendations

### Gaps & Opportunities
- Missing Notifications.
- Missing Reporting (note: project has /api/dashboard already).
- Missing Integration API.

### Strategic Feature Suggestions
1. Multi-scenario Modeling Agent (optimistic/baseline/pessimistic scenarios).
2. Adaptation Roadmap Generator.
3. Supply Chain Climate Risk Mapping.
4. Integrations: Real estate APIs (Zillow, CoStar), supply chain (Project44), climate data (ClimateAI).

## Categorization
- **MECHANICAL:** notifications subsystem, webhook subscriptions.
- **NEEDS-CREDS:** Real estate / supply chain / climate-data API integrations.
- **NEEDS-PRODUCT-DECISION:** Multi-scenario modeling, adaptation roadmap, supply chain mapping.

## Implementations applied
1. **`server/routes/notifications.js`** — full CRUD with DB-detect + memory fallback (no auth, matching project convention).
2. **`server/routes/webhooks.js`** — registry CRUD + manual test-delivery.
3. **`server/index.js`** — mounted at `/api/notifications` and `/api/webhooks`.

Syntax-checked with `node --check`.

## Backlog (prioritized)

### High priority
- **Outbound dispatch worker** — wire `/api/climate-alerts` and `/api/alerts` insertions to fan out to webhooks + notifications.
- **`POST /api/ai/scenario-model`** — multi-scenario climate impact modeling endpoint.

### Medium priority
- **Supply chain mapping** — needs supplier/vendor data model first.
- **`POST /api/ai/adaptation-roadmap`** — adaptation strategy generator from location + industry.

### Low priority
- Zillow/CoStar/Project44/ClimateAI integrations (NEEDS-CREDS).
- White-label resold dashboards.

## Apply pass 3 (frontend)

- **Status:** LEFT-AS-IS.
- Verified `client/src/pages/AIAnalysis.jsx` already covers all 18 backend AI endpoints (`/api/ai/*` from `routes/ai.js` + `routes/aiNew.js`).
- Bearer JWT auth wired via `client/src/api.js` interceptor reading `localStorage.token`.
- Error/503 surfaced through `error.response?.data?.error`. Model + token usage rendered.
- No files changed. Idempotence rule satisfied.
- Log: `/Users/erolakarsu/projects/_AUDIT/apply3_logs/ab3_61.md`.

## Apply pass 4 (mechanical backlog)

Implemented 2 of the High/Medium priority MECHANICAL items from the backlog (skipping the dispatch-worker — flagged as risky cross-route wiring).

### BE — `server/routes/aiNew.js`
- Added 503-on-no-key guard inside the existing `askAI(prompt, systemPrompt)` helper (`statusCode = 503` thrown when `process.env.OPENROUTER_API_KEY` is unset). Existing routes still use the helper; new routes additionally map `err.statusCode === 503` → `res.status(503).json({ error: 'AI not configured' })`.
- `POST /api/ai/scenario-model` — body `{ region, timeframe, scenarios? }`. Returns multi-scenario climate impact model (optimistic / baseline / pessimistic by default). Persists via existing `saveAnalysis(...)` helper.
- `POST /api/ai/adaptation-roadmap` — body `{ location, industry, horizon_years? }`. Returns phased adaptation roadmap (Phase 1: 0-2y, Phase 2: 2-5y, Phase 3: 5-Ny).

### FE — `client/src/pages/AIAnalysis.jsx`
- Two new entries appended to `ANALYSIS_TYPES` (existing unified picker page at `/api/ai/*`):
  - `scenario-model` → fields: `region`, `timeframe`, `scenarios`.
  - `adaptation-roadmap` → fields: `location`, `industry`, `horizon_years`.
- Existing JWT-bearer wiring via `client/src/api.js` interceptor + 503/error surfacing reused.

### Skipped (still backlog)
- Outbound dispatch worker wiring climate-alerts/alerts → webhooks/notifications (TOO-RISKY: touches multiple existing routes; better as separate focused pass).
- Supply-chain mapping (NEEDS-PRODUCT-DECISION: supplier/vendor model first).
- Real-estate / supply-chain / climate-data third-party integrations (NEEDS-CREDS).

### Verification
- `node --check server/routes/aiNew.js` → OK.
- Smoke test: server started on port 4799 with `OPENROUTER_API_KEY` removed from `.env`; registered user via `/api/auth/register`; `POST /api/ai/scenario-model` with bearer token returned `{"error":"AI not configured"}` HTTP 503. `.env` restored after test.
- Log: `/Users/erolakarsu/projects/_AUDIT/apply4_logs/ab3_61.md`.
