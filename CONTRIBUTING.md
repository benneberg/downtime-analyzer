# Contributing to Factory Insight AI

Thank you for contributing to Factory Insight AI. This document outlines the development workflow, coding standards, and verification requirements.

---

## 1. Prerequisites & Environment

- **Node.js**: Version `>= 18.0.0` (Node 22 recommended)
- **Package Manager**: `npm` (v9+) or `bun`
- **Port Requirement**: The dev server binds to `0.0.0.0:3000`. Ensure port 3000 is available on your machine.

---

## 2. Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/benneberg/downtime-analyzer.git
   cd downtime-analyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set up your Gemini API key:
   ```bash
   cp .env.example .env
   # Edit .env and set GEMINI_API_KEY=your_key_here
   ```
   *Note: If you do not have an API key, the platform will automatically use built-in offline heuristic engines.*

4. Launch the local development server:
   ```bash
   npm run dev
   ```
   Access the application at `http://localhost:3000`.

---

## 3. Code Conventions & Standards

### TypeScript
- All code must be written in TypeScript with strict type checking enabled.
- Avoid using `any` where explicit domain interfaces can be defined (`PLCAlarm`, `OperatorLog`, `MaintenanceEvent`, `ProductionStop`).
- Do not use `const enum`; use standard TypeScript `enum` declarations or string union types.

### React Components
- Use React 18/19 functional components and hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
- Maintain clean modularity: keep domain scenarios in `src/data/`, extracted views in `src/components/`, and the main shell in `src/App.tsx`.
- Avoid infinite re-render loops in `useEffect`. Prefer primitive values in dependency arrays.

### Styling & Design
- Style exclusively with **Tailwind CSS** utility classes.
- Tailwind is loaded via `@import "tailwindcss";` in `src/index.css`. Do not add secondary CSS files or inline `style` objects.
- High-contrast, clean industrial theme: default to dark neutral surfaces (`#0f1115`, `#16191f`) with industrial amber (`amber-500`) and slate accents.

### Icons & Animations
- **Icons**: Import exclusively from `lucide-react`. Do not write custom inline SVGs.
- **Animations**: Import exclusively from `motion/react`.

### Backend & API Routes
- All server-side logic resides in `server.ts`.
- Expose all API routes under `/api/*`.
- Keep API keys server-side: never prefix `GEMINI_API_KEY` with `VITE_` or expose secrets in client responses.
- Always implement graceful fallbacks so endpoints return usable data even when an external API key is absent.

---

## 4. Verification Workflow

Before committing code or submitting a pull request, run the complete verification suite:

1. **Linting & Type Check**:
   ```bash
   npm run lint
   ```
   *Must pass with 0 errors (`tsc --noEmit`).*

2. **Production Build Compilation**:
   ```bash
   npm run build
   ```
   *Must successfully produce both `dist/` (client bundle) and `dist/server.cjs` (backend bundle).*

3. **Runtime Verification**:
   ```bash
   npm start
   ```
   *Verify that the compiled bundle starts and runs on port 3000.*

---

## 5. Pull Request Guidelines

- Ensure your branch is up to date with `master`.
- Keep PRs focused on a single feature or bug fix.
- Verify that both `npm run lint` and `npm run build` pass without warnings or errors.
- Document any new configuration parameters in `.env.example` and `README.md`.
