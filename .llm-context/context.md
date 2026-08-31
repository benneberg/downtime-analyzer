# Coding Agent Context & Invariants

> Essential constraints, dangerous areas, conventions, and operational instructions for AI coding assistants working in this repository.

---

## 1. Authoritative Documentation Map

Before taking action, refer to the authoritative documentation:
- **Product Purpose & User Features**: `README.md`
- **System Components, Data Flow & Invariants**: `ARCHITECTURE.md`
- **Development Commands & Code Conventions**: `CONTRIBUTING.md`
- **Security Policy & Credential Boundaries**: `SECURITY.md`

---

## 2. Critical Runtime & Architectural Constraints

1. **Port & Host Binding (Strict Container Constraint)**:
   - The dev server and production server MUST bind to port `3000` and host `0.0.0.0`.
   - Never change the port to 3001, 5173, or read dynamic port allocations. The external container proxy routes traffic strictly through port 3000.

2. **Full-Stack Architecture (Express + Vite)**:
   - Development server boots via `tsx server.ts` with Vite mounted as middleware (`appType: "spa"`).
   - Production build compiles client assets with `vite build` and bundles `server.ts` into a CommonJS artifact `dist/server.cjs` via `esbuild`.
   - Production launch is `node dist/server.cjs`.

3. **API Key Security (Never Expose to Client)**:
   - `GEMINI_API_KEY` is a server-side secret (`process.env.GEMINI_API_KEY`).
   - NEVER prefix `GEMINI_API_KEY` with `VITE_` or expose it in API route responses.
   - All AI routes (`/api/analyze`, `/api/plc-review`) must include fallback handling when the key is unconfigured.

4. **Framework & Styling Rules**:
   - **React**: React 18/19 functional components only.
   - **Tailwind CSS**: Tailwind is imported via `@import "tailwindcss";` in `src/index.css`. Do not add custom CSS files or PostCSS configurations.
   - **Icons**: Import exclusively from `lucide-react`. Never generate inline SVGs.
   - **Animations**: Import exclusively from `motion/react`.

---

## 3. Dangerous Areas & Common Traps

1. **Client-Side Regex in `src/components/DataTables.tsx`**:
   - User-defined search-and-replace rules instantiate `new RegExp()`. Always wrap in `try / catch` blocks to prevent malformed user patterns from crashing the browser runtime.

2. **Chart Rendering & Memory Boundaries (`src/components/DashboardCharts.tsx`)**:
   - Never pass raw, undecimated telemetry arrays (>1,000 items) directly into Recharts. Always route through the `decimateAlarms` downsampler to protect the browser frame rate.

3. **Database Assumptions**:
   - There is no persistent SQL or NoSQL database running in this repository. Do not import database clients (e.g. pg, prisma, mongoose) unless explicitly requested. Application state lives in React `useState` and local scenario fixtures (`src/data/scenarios.ts`).

4. **Express Middleware Ordering (`server.ts`)**:
   - API routes (`/api/*`) MUST be mounted before the Vite middleware or static fallback wildcard handler (`app.get("*")`).

---

## 4. Operational Commands

| Command | Purpose | Verification Requirement |
| :--- | :--- | :--- |
| `npm run lint` | TypeScript static type verification (`tsc --noEmit`) | Must exit with code 0 before completing tasks. |
| `npm run build` | Builds client static assets and bundles `dist/server.cjs` | Must build cleanly without compilation errors. |
| `npm run dev` | Boots full-stack development environment | Listens on `http://0.0.0.0:3000`. |
| `npm start` | Launches compiled production bundle | Executes `node dist/server.cjs`. |
