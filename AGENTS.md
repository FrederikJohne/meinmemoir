<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

### Architecture
Monorepo with 3 services — see `README.md` for full details:
| Service | Dir | Port | Dev command |
|---------|-----|------|-------------|
| **web** (Next.js 16) | `/workspace` | 3000 | `npm run dev` |
| **worker** (Node.js) | `/workspace/worker` | 3001 | `node server.js` (or `node --watch server.js`) |
| **scheduler** (Node.js) | `/workspace/scheduler` | 3002 | `node server.js` |

### Running services
- **Web:** `npm run dev` from root. Landing page works without real Supabase credentials; dashboard/auth routes require valid Supabase env vars.
- **Worker / Scheduler:** Need env vars `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set. Health endpoints (`/api/health`) respond even with placeholder credentials. Worker also needs `DEEPGRAM_API_KEY` and `OPENAI_API_KEY` for actual processing.
- The middleware file triggers a Next.js deprecation warning (`"middleware" → "proxy"`); this is cosmetic and does not block build or dev.

### Lint / Build / Test
- **Lint:** `npx eslint .` (ESLint 9 flat config; worker and scheduler are excluded via `globalIgnores`)
- **Build:** `npm run build` (standalone output mode)
- **TypeScript:** Checked during build (`next build` runs TS)
- No automated test framework is configured in the repo.

### Environment variables
No `.env.example` file exists. Create `.env.local` in the root with at minimum:
```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
NEXT_PUBLIC_APP_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID
```
Worker additionally needs: `DEEPGRAM_API_KEY`, `OPENAI_API_KEY`.
Scheduler additionally needs: `WHATSAPP_*` and/or `TWILIO_*` vars (optional for dev).

### Lockfile
Uses `npm` (has `package-lock.json`). Each service (`worker/`, `scheduler/`) has its own `package.json` and must have `npm install` run separately.
