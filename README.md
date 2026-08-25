# Factory Insight AI (Downtime Analyzer)

## Overview
Factory Insight AI is a full-stack industrial analytics and automation suite. It correlates real-time PLC alarm telemetry, manual operator shift logs, maintenance work orders, and production stop events to discover root causes of manufacturing downtime. The platform features automated 5-Whys AI report generation, statistical ISA-18.2 anomaly alerts, IEC 61131-3 Structured Text PLC code review, and SCADA (OPC UA / MQTT Sparkplug B) telemetry monitoring.

---

## Requirements
- **Node.js**: >= 18.0.0
- **npm** or **bun**
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge

---

## Installation
```bash
npm install
```

---

## Configuration
The application reads environment variables from `.env` or process environment:

- `GEMINI_API_KEY`: *(Optional)* Google Gemini API key used by the backend Express server (`server.ts`) to generate real-time 5-Whys reports and PLC code audits via `@google/genai`. If unset, the system automatically falls back to built-in offline heuristic analysis.
- `PORT`: `3000` *(Default backend port)*
- `NODE_ENV`: Set to `production` in production mode to serve bundled static assets from `dist/`.

---

## Usage

### Development Mode
Starts the full-stack application with Vite middleware mounted on Express:
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### Available Modules in UI
1. **Downtime Analyzer**: Select preloaded industrial scenarios (Bottling Line, Packaging Line, CNC Cell), review unified sequence-of-events timelines, inspect precursor alarms, and trigger AI 5-Whys root cause analysis.
2. **PLC Code Review**: Ingest or paste IEC 61131-3 Structured Text (`.st`, `.xml`), perform static Hungarian notation style checks, run AI safety audits, and apply 1-click refactored code diffs.
3. **SCADA / Live Bridge (Connected Factory)**: Simulate OPC UA server address space browsing and register polling (`opc.tcp://...`), subscribe to MQTT Sparkplug B metric streams, and manage Role-Based Access Control (RBAC) permissions.

---

## Testing
UNSET

*(No automated test script is currently configured in `package.json`. Code verification is performed via `npm run lint` and `npm run build`.)*

---

## Build
To compile both the client-side single-page application and the backend server bundle:
```bash
npm run build
```
This runs:
1. `vite build` — bundles frontend assets into `dist/`
2. `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs` — bundles the server into `dist/server.cjs`

---

## Deployment
To launch the production server after building:
```bash
npm start
```
This executes `node dist/server.cjs`, serving the compiled static assets and API routes on port 3000.

---

## Repository Structure
```
├── .env.example               # Environment variable declaration template
├── index.html                 # Frontend HTML shell
├── metadata.json              # Platform application metadata
├── package.json               # Dependencies and build scripts
├── server.ts                  # Express backend & Vite middleware entry point
├── tsconfig.json              # TypeScript compiler configuration
├── vite.config.ts             # Vite build configuration
├── src/
│   ├── main.tsx               # Client React entry point
│   ├── App.tsx                # Main workspace application component
│   ├── index.css              # Global Tailwind CSS styling
│   ├── data/
│   │   └── scenarios.ts       # Preloaded manufacturing datasets & scenarios
│   └── components/
│       ├── ConnectedFactory.tsx    # OPC UA & MQTT Sparkplug B interface
│       ├── DashboardCharts.tsx     # Recharts metrics & ISA-18.2 anomaly badges
│       ├── DataTables.tsx          # Tabbed data grids & CSV ingestion rules
│       ├── PlcCodeReview.tsx       # Structured Text IEC 61131-3 code reviewer
│       ├── PrecursorDetection.tsx  # Pre-downtime micro-alarm scanner
│       ├── PricingPlans.tsx        # Tier comparison & technical capabilities
│       ├── RootCauseReport.tsx     # 5-Whys AI analysis report view
│       ├── ScenarioSelector.tsx    # Scenario selection toolbar
│       └── TimelineAlignment.tsx   # Sequence-of-events chronological view
```
