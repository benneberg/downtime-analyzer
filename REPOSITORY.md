schema:
  version: 1
  compatible_with:
    - CCC
  generated_by: Repository Bootstrap Prompt
  generated_at: 2026-08-25T03:33:59-07:00
  repository: 60f9b35f-3fa3-433e-b53d-4fc316191fc8

overview:
  value: "Factory Insight AI is a full-stack industrial downtime analytics and code verification application built with TypeScript, React 19, Express, Vite, and Google GenAI SDK."
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json"
    - "server.ts"
    - "src/App.tsx"
  notes: ""

purpose:
  value: "To aggregate, correlate, and analyze manufacturing machine telemetry (PLC alarms), human shift notes, and maintenance work orders to uncover true root causes of downtime using AI and statistical heuristics."
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "README.md"
    - "metadata.json"
    - "server.ts (/api/analyze)"
  notes: ""

scope:
  value: "Full-stack single-repository web application covering 3 operational modules: Downtime Root Cause Analyzer, PLC Code Reviewer, and Connected Factory SCADA Bridge."
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "src/App.tsx (module navigation: downtime, plc_review, connected_factory)"
  notes: ""

capabilities:
  value:
    - "Cross-system event correlation across PLC alarms, operator logs, and maintenance events"
    - "AI-driven 5-Whys root cause analysis generation using Gemini 3.5 Flash"
    - "Statistical baseline anomaly detection based on ISA-18.2 standards"
    - "Precursor alarm signature analysis (<2m, <5m, <10m windows)"
    - "IEC 61131-3 Structured Text static naming and safety auditing with 1-click auto-fix diffs"
    - "Simulated OPC UA address space browsing and register polling"
    - "MQTT Sparkplug B telemetry streaming and payload decoding"
    - "Role-Based Access Control (RBAC) simulation (Admin, Analyst, Viewer)"
    - "Custom CSV log ingestion engine with column mapping, timezone adjustments, and regex substitutions"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "src/components/*.tsx"
    - "server.ts"
  notes: ""

verified_features:
  value:
    - "Interactive industrial scenario presets (Bottling Line, Packaging Line, CNC Cell)"
    - "Real-time AI root cause generation with offline fallback logic"
    - "Decimated interactive Recharts data visualizations"
    - "Multi-tab live diagnostic data table with manual entry and CSV import"
    - "OPC UA polling loop with live diagnostic event stream"
    - "MQTT Sparkplug B live telemetry stream decoder"
    - "Structured Text syntax and safety review with downloadable/copyable refactored code"
    - "Report export to formatted printable PDF and JSON"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "Direct code inspection in src/components/ and server.ts"
    - "Successful build and lint verification"
  notes: ""

inferred_features:
  value:
    - "Designed for deployment to containerized runtime platforms (Cloud Run / Docker)"
  evidence_state: INFERRED
  confidence: HIGH
  evidence:
    - "server.ts binds to host 0.0.0.0 and port 3000"
    - "package.json build script outputs bundled CommonJS server to dist/server.cjs"
  notes: ""

future_indicators:
  value:
    - "Persistent cloud database integration (e.g. Firestore / Cloud SQL)"
    - "Direct socket-level native OPC UA TCP and MQTT client connection drivers"
    - "Expanded automated test suite with Vitest / Playwright"
  evidence_state: OBSERVED
  confidence: MEDIUM
  evidence:
    - "ROADMAP.md"
    - "TODO.md"
  notes: ""

technology_stack:
  value:
    frontend:
      - "React 19.0.1"
      - "Vite 6.2.3"
      - "Tailwind CSS 4.1.14"
      - "Recharts 3.9.2"
      - "Motion 12.23.24"
      - "Lucide React 0.546.0"
    backend:
      - "Node.js (ESM / CJS bundle)"
      - "Express 4.21.2"
      - "dotenv 17.2.3"
      - "@google/genai 2.4.0"
      - "esbuild 0.25.0"
      - "tsx 4.21.0"
    tooling:
      - "TypeScript 5.8.2"
      - "npm"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json"
    - "tsconfig.json"
    - "vite.config.ts"
  notes: ""

repository_structure:
  value:
    - "server.ts: Express API and Vite middleware server entry point"
    - "vite.config.ts: Vite configuration with React and Tailwind plugins"
    - "tsconfig.json: TypeScript compiler configuration"
    - "package.json: Package manifest and build scripts"
    - "index.html: Web application HTML shell"
    - "metadata.json: Platform application metadata and permissions"
    - "src/main.tsx: Client React root mount"
    - "src/App.tsx: Primary multi-module workspace component"
    - "src/index.css: Global Tailwind styles"
    - "src/data/scenarios.ts: Preloaded industrial dataset scenarios"
    - "src/components/ConnectedFactory.tsx: OPC UA & MQTT Sparkplug B client"
    - "src/components/PlcCodeReview.tsx: Structured Text IEC 61131-3 code auditor"
    - "src/components/RootCauseReport.tsx: 5-Whys AI report generator"
    - "src/components/DashboardCharts.tsx: Statistical charts and ISA-18.2 anomaly alerts"
    - "src/components/TimelineAlignment.tsx: Millisecond sequence-of-events chronological view"
    - "src/components/PrecursorDetection.tsx: Micro-alarm precursor window scanner"
    - "src/components/DataTables.tsx: Live data grids, manual log creation, and CSV ingestion rules"
    - "src/components/ScenarioSelector.tsx: Preset industrial dataset picker"
    - "src/components/PricingPlans.tsx: Commercial tier and technical capability cards"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "Filesystem enumeration of / and /src"
  notes: ""

configuration:
  value:
    - "GEMINI_API_KEY: Optional server-side API key for live AI synthesis via Google GenAI"
    - ".env.example: Declares GEMINI_API_KEY environment variable"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - ".env.example"
    - "server.ts (process.env.GEMINI_API_KEY)"
  notes: ""

build_process:
  value: "npm run build executes 'vite build' to compile client assets into dist/, followed by 'esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs' to bundle the backend."
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json (scripts.build)"
  notes: ""

deployment:
  value: "Production runtime initiates via 'npm start' (node dist/server.cjs), serving static SPA files from dist/ and handling API routes on port 3000."
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json (scripts.start)"
    - "server.ts"
  notes: ""

repository_boundaries:
  value:
    - "Client communicates with backend solely via HTTP JSON endpoints under /api/*"
    - "AI model calls are restricted to server-side execution via @google/genai"
    - "All telemetry ingestion is handled in-memory and client-side state without external database dependencies"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "server.ts"
    - "src/components/*.tsx"
  notes: ""

known_unknowns:
  value:
    - "Long-term production multi-tenant database storage strategy"
    - "Automated end-to-end regression test suite execution"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "Absence of database drivers (e.g. pg, mongoose, @google-cloud/firestore) in package.json"
    - "Absence of test scripts in package.json"
  notes: ""

confidence_summary:
  value: HIGH
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "All codebase files directly read, audited, and verified via build/lint"
  notes: ""
