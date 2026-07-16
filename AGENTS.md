# catchTube

Two-app monorepo under `apps/`: Express backend + Vite/React frontend.

## Commands

### Backend (`apps/backend`)
| Command | Action |
|---|---|
| `npm run server` | Dev server with `--watch` on port from `PORT` env (default 5050) |
| `npm run worker` | pg-boss background job worker |

### Frontend (`apps/frontend`)
| Command | Action |
|---|---|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier (`**/*.{ts,tsx}`, no semicolons, double quotes, printWidth 80) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run preview` | Vite preview build |

**Order**: `lint -> typecheck -> build` before committing frontend changes.

## Architecture

### Backend
- **Stack**: Express 5 (ESM), Prisma + PostgreSQL, better-auth, pg-boss, Google APIs (YouTube Data v3), Gemini, Tavily
- **Flow**: `routes/` → `controllers/` → `services/` → Prisma
- **Auth**: better-auth handles `/api/auth/*` (email OTP + Google OAuth with YouTube scopes). Passport.js Google strategy exists but is **not wired** in `server.js` — routes/middleware are commented out.
- **Background jobs**: pg-boss with 2 scheduled queues:
  - `sync-youtube-playlist` — every 2h (fetch new videos → add to playlists → retry failed)
  - `sync-empty-videos` — every 3h (cleanup)
- **Env**: `.env` at `apps/backend/.env` — requires `DATABASE_URL`, `GOOGLE_CLIENT_ID/SECRET`, `YOUTUBE_API_KEY`, `GEMINI_API_KEY`, `TAVILY_API_KEY`, `BETTER_AUTH_SECRET`, `FRONTEND_URL`, email credentials
- **Prisma**: schema at `prisma/schema.prisma`; generated client in `generated/prisma/`; `prisma.config.ts` uses dotenv

### Frontend
- **Stack**: Vite 7, React 19, TanStack Router (file-based, auto code-splitting), TanStack Query, Tailwind CSS v4, shadcn/ui (Radix Nova)
- **Entrypoint**: `src/main.tsx` (not `App.tsx` — `App.tsx` is a stub)
- **Router**: routes in `src/routes/` — `routeTree.gen.ts` is **auto-generated** by `@tanstack/router-plugin`; never edit manually
- **Auth client**: better-auth client in `src/lib/auth-client.ts`, wrapped in `src/hooks/useAuth.ts`
- **API client**: axios instance in `src/lib/axios.ts` with `withCredentials: true`
- **Env**: `VITE_API_URL` in `apps/frontend/.env`
- **Alias**: `@/` → `src/`
- **Styling**: Tailwind v4 via `@tailwindcss/vite`; shadcn/ui components under `src/components/ui/`; add new ones with `npx shadcn@latest add <name>`
- **TypeScript**: strict mode, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `verbatimModuleSyntax`
