# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Porcicultura (pig farming) management frontend — a React + Vite + MUI admin dashboard, forked from the Minimal UI kit (`@minimal/material-kit-react`). The original kit's demo sections (user, product, blog, overview) are kept as scaffolding; the real domain lives in the **batches → batch-stages → batch-stage-details → batch-stage-report** hierarchy. The UI and code comments are in Spanish.

## Commands

```bash
yarn dev            # Vite dev server on http://localhost:3039 (host: true, exposed on LAN)
yarn build          # tsc type-check, then vite build
yarn lint           # eslint over src/**/*.{js,jsx,ts,tsx}
yarn lint:fix       # eslint --fix
yarn fm:fix         # prettier --write
yarn fix:all        # lint:fix + fm:fix
yarn tsc:watch      # tsc --noEmit --watch (type-check only)
```

There is no test runner configured. `vite-plugin-checker` runs TypeScript and ESLint inline during `yarn dev` and surfaces errors as an overlay.

Node `>=20`, package manager is `yarn@1.22.22`.

## Architecture

### Layered feature structure
Each feature is split across three directories that mirror each route:
- `src/pages/<feature>.tsx` — thin route component; sets `<title>` and renders the View.
- `src/sections/<feature>/view/<feature>-view.tsx` — the page body: owns state, data fetching, table logic, and renders rows/modals. Re-exported via the section's `view/index.ts`.
- `src/sections/<feature>/` — supporting pieces: `*-table-row`, `*-table-head`, `*-table-toolbar`, `utils.ts` (filter/sort helpers), and a `modals/` subfolder for create/edit dialogs.

Routes are declared in `src/routes/sections.tsx` (all pages are `lazy()`-loaded). The domain route hierarchy is nested by URL params:
```
/batches
/batches/:batchId/batch-stages
/batches/:batchId/batch-stages/:batchStageId
/batches/:batchId/batch-stages/:batchStageId/report
```

### HTTP layer — `src/services/axios-instance/api.ts`
All backend calls go through the single `api` instance. Key behaviors to know:
- **The response interceptor unwraps the payload**: it returns `response.data.data` (or `response.data`), so `await api.get<T>(...)` resolves to `T` directly — never `AxiosResponse<T>`. Type your calls as `api.get<Foo>(...)` and use the result as `Foo`.
- `withCredentials: true` — auth is **cookie-based**, not bearer-token. The Firebase ID token is only sent once at login.
- On any `401`, the interceptor imperatively clears the auth store (`useAuthStore.getState().setUser(null)`) and hard-redirects to `/sign-in`.
- `baseURL` in dev is `http://${window.location.hostname}:3000` (the local backend); in prod it's `VITE_API_BASE_URL`.

### Authentication flow
- Login is **Google-only via Firebase popup** (`src/sections/auth/sign-in-view.tsx`). It gets a Firebase ID token, POSTs it to `/auth/google/login`, and the backend sets a session cookie.
- After login, if the returned user has no `company`, route to `/register` (company onboarding); otherwise to `/`.
- `src/auth/auth-store.ts` — Zustand store holding `user`/`loading`. `checkAuth()` hits `/auth/me` and runs once on app mount (`src/app.tsx`).
- `src/auth/auth-guard.tsx` — `AuthGuard` wraps the dashboard routes; renders nothing while loading and redirects to `/sign-in` when unauthenticated.

### State
Global state is **Zustand** (`auth-store.ts`). Most feature state is local `useState` inside the View component. Forms use **react-hook-form** (`register`/`handleSubmit`). Toasts use **sileo** (`<Toaster>` mounted in `src/main.tsx`).

### Imports & aliases
`src/...` is an alias for the `src` directory (configured in both `vite.config.ts` and `tsconfig.json` `baseUrl`). Import shared code as `src/components/...`, `src/services/...`, etc.

### Layout & theme
- `src/layouts/dashboard/` wraps authenticated pages; `src/layouts/auth/` wraps sign-in/register.
- Sidebar nav items are hardcoded in `src/layouts/nav-config-dashboard.tsx` (`navData`) — add a feature here to surface it in the nav.
- Theme lives in `src/theme/` (MUI v7 with CSS vars; use `theme.vars.palette...`).
- Page headers use `<CustomBreadcrumbs>` (`src/components/custom-breadcrumbs`).

## Conventions

- Files carry Spanish comment headers (Description / Created by / dates) — match this style when adding service files.
- `_mock` data and the demo sections (user/product/blog/overview) are leftover kit scaffolding; some views still import `_users` etc. Don't assume they reflect real domain data.
- SPA routing is rewritten to `index.html` on Vercel (`vercel.json`).
