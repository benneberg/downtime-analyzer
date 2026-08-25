schema:
  version: 1
  compatible_with:
    - CCC
  generated_by: Repository Bootstrap Prompt
  generated_at: 2026-08-25T03:33:59-07:00
  repository: 60f9b35f-3fa3-433e-b53d-4fc316191fc8

architecture_style:
  value: "Full-Stack Single-Page Application (SPA) with API Gateway / Backend-For-Frontend (BFF)"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "server.ts (Express serving /api/* and acting as Vite middleware / static host)"
    - "src/App.tsx (React SPA root managing client-side view routing)"
  notes: ""

major_components:
  value:
    - name: "Express API Server (server.ts)"
      role: "Backend API gateway handling AI orchestration, PLC code review, and OPC UA / SCADA simulation"
    - name: "Root Application Manager (src/App.tsx)"
      role: "Top-level layout, module navigation, role-based state, and scenario hydration"
    - name: "Downtime Analyzer Suite (src/components/RootCauseReport.tsx, TimelineAlignment.tsx, PrecursorDetection.tsx, DashboardCharts.tsx)"
      role: "Cross-system event correlation, ISA-18.2 anomaly alerts, and 5-Whys generation"
    - name: "PLC Code Review Module (src/components/PlcCodeReview.tsx)"
      role: "IEC 61131-3 static validator and AI safety logic auditor"
    - name: "Connected Factory Bridge (src/components/ConnectedFactory.tsx)"
      role: "OPC UA polling engine and MQTT Sparkplug B client simulator"
    - name: "Data Ingestion Hub (src/components/DataTables.tsx)"
      role: "Tabbed record inspection, manual event entry, and CSV log parsing"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "server.ts"
    - "src/App.tsx"
    - "src/components/*.tsx"
  notes: ""

responsibilities:
  value:
    - server_ts: "Securely proxies Gemini 3.5 Flash requests using server-side GEMINI_API_KEY, provides fallback heuristics when unconfigured, and serves static files"
    - app_tsx: "Coordinates scenario selection, state lifting for alarm and stop records, and high-level role access"
    - client_components: "Executes client-side filtering, decimation, mathematical baseline calculations, and UI rendering"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "server.ts"
    - "src/App.tsx"
  notes: ""

dependency_flow:
  value:
    - "Client Components -> src/data/scenarios.ts (Initial state)"
    - "Client Components -> Backend /api/analyze (AI Root Cause)"
    - "Client Components -> Backend /api/plc-review (AI/Static Code Review)"
    - "Client Components -> Backend /api/opcua/* (Address Space & Polling)"
    - "Backend (server.ts) -> Google GenAI SDK (@google/genai) -> Google Gemini API"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "server.ts"
    - "src/components/*.tsx"
  notes: ""

data_flow:
  value:
    - "1. User selects preloaded scenario or uploads CSV logs into DataTables."
    - "2. State is stored in React memory (plcAlarms, operatorLogs, maintenanceEvents, productionStops)."
    - "3. Precursor scanner and timeline components compute cross-correlations synchronously in client."
    - "4. User triggers 'Run AI Root Cause Analysis' or 'Run AI Safety Audit' -> POST request to Express backend."
    - "5. Backend invokes Gemini 3.5 Flash (or runs heuristic fallback) and returns structured JSON."
    - "6. UI renders formatted 5-Whys diagrams, corrective action tables, or code diffs."
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "src/components/RootCauseReport.tsx"
    - "src/components/PlcCodeReview.tsx"
    - "server.ts"
  notes: ""

source_of_truth:
  value: "Client React state in App.tsx (in-memory, hydrated from src/data/scenarios.ts, CSV ingestion, or live OPC UA polling)"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "src/App.tsx (useState hooks for alarms, logs, stops, events)"
  notes: ""

entry_points:
  value:
    - backend: "server.ts (Express server listening on 0.0.0.0:3000)"
    - frontend: "index.html -> src/main.tsx -> src/App.tsx"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json"
    - "index.html"
    - "server.ts"
  notes: ""

external_systems:
  value:
    - system: "Google Gemini API (gemini-3.5-flash)"
      protocol: "HTTPS / REST (via @google/genai SDK)"
      status: "Optional (gracefully falls back to heuristic engine if GEMINI_API_KEY is unconfigured)"
    - system: "Industrial SCADA / OPC UA & MQTT Broker"
      protocol: "opc.tcp and mqtts (simulated via backend Express routes and client streaming)"
      status: "Simulated"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "server.ts"
    - "src/components/ConnectedFactory.tsx"
  notes: ""

extension_points:
  value:
    - "Additional PLC controllers and standards in src/components/PlcCodeReview.tsx SAMPLE_PROGRAMS"
    - "Additional industrial scenarios in src/data/scenarios.ts INDUSTRIAL_SCENARIOS"
    - "New telemetry protocols in src/components/ConnectedFactory.tsx"
    - "Production database adapter replacing in-memory React state in App.tsx"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "src/data/scenarios.ts"
    - "src/components/PlcCodeReview.tsx"
  notes: ""

configuration:
  value:
    - "GEMINI_API_KEY: Process environment secret for AI synthesis"
    - "PORT: Hardcoded to 3000 for container reverse proxy"
    - "NODE_ENV: Determines development (Vite middleware) vs production (dist/ static files)"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "server.ts"
    - ".env.example"
  notes: ""

constraints:
  value:
    - "Container ingress binds strictly to host 0.0.0.0 and port 3000"
    - "Hot Module Replacement (HMR) is disabled in platform sandbox (DISABLE_HMR=true)"
    - "Client runs in sandboxed iframe environment"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "server.ts"
    - "vite.config.ts"
  notes: ""

architecture_risks:
  value:
    - "In-memory client state does not persist across full browser page reloads unless exported"
    - "API rate limits or network latency on external Gemini API calls during large payload analysis"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "src/App.tsx"
    - "server.ts"
  notes: ""

improvement_opportunities:
  value:
    - "Implement persistent database storage (Firestore / PostgreSQL) for multi-shift historical logs"
    - "Add automated end-to-end testing with Playwright or Vitest"
    - "Implement native node-opcua or mqtt driver for live hardware integration in on-premise deployments"
  evidence_state: INFERRED
  confidence: HIGH
  evidence:
    - "ROADMAP.md"
    - "TODO.md"
  notes: ""

unknown_areas:
  value:
    - "Target deployment container orchestrator beyond Cloud Run specifications"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "server.ts"
  notes: ""
