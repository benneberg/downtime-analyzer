schema:
  version: 1
  compatible_with:
    - CCC
  generated_by: Repository Bootstrap Prompt
  generated_at: 2026-08-25T03:33:59-07:00
  repository: 60f9b35f-3fa3-433e-b53d-4fc316191fc8

repository_summary:
  value: "Factory Insight AI is a full-stack industrial analytics platform connecting machine telemetry (PLC alarms), operator shift logs, and maintenance events. It provides automated 5-Whys root cause analysis, statistical ISA-18.2 anomaly alerts, IEC 61131-3 PLC code auditing, and SCADA OPC UA/MQTT telemetry decoding."
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "README.md"
    - "package.json"
    - "server.ts"
  notes: ""

technology_summary:
  value: "TypeScript full-stack codebase. Backend is Node.js/Express with @google/genai SDK. Frontend is React 19, Vite, Tailwind CSS, Lucide icons, Motion, and Recharts."
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json"
    - "tsconfig.json"
  notes: ""

architecture_summary:
  value: "Single-repository Express + Vite application. The Express server acts as Vite development middleware in dev mode and serves static dist/ assets in production, exposing /api/* endpoints for Gemini AI analysis, PLC code review, and OPC UA simulation."
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "server.ts"
    - "vite.config.ts"
  notes: ""

coding_patterns:
  value:
    - "Modular React functional components with Tailwind utility styling"
    - "Array decimation/downsampling for large time-series telemetry to maintain 60fps"
    - "Graceful degradation / offline heuristics when GEMINI_API_KEY is not configured"
    - "Type-safe interfaces for PLCAlarm, OperatorLog, MaintenanceEvent, ProductionStop"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "src/components/*.tsx"
    - "server.ts"
  notes: ""

naming_patterns:
  value:
    - "Components: PascalCase (e.g. ConnectedFactory.tsx, PlcCodeReview.tsx)"
    - "Data files: camelCase (e.g. scenarios.ts)"
    - "API routes: kebab-case/lowercase (e.g. /api/analyze, /api/plc-review, /api/opcua/nodes)"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "src/components/"
    - "server.ts"
  notes: ""

important_conventions:
  value:
    - "Port 3000 and 0.0.0.0 host binding are mandatory for container ingress"
    - "Tailwind CSS is imported globally via @import 'tailwindcss' in src/index.css"
    - "All icons must be imported from lucide-react"
    - "Motion animations must be imported from motion/react"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "server.ts"
    - "src/index.css"
    - "package.json"
  notes: ""

critical_files:
  value:
    - "server.ts: Central Express server and API gateway"
    - "src/App.tsx: Primary client UI container, module manager, and state hub"
    - "src/components/RootCauseReport.tsx: 5-Whys AI correlation report view"
    - "src/components/PlcCodeReview.tsx: Structured Text code auditor"
    - "src/components/ConnectedFactory.tsx: OPC UA and MQTT telemetry interface"
    - "src/data/scenarios.ts: Domain data models and preset industrial incidents"
    - "package.json: Build scripts and dependencies"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "Filesystem structure"
  notes: ""

primary_entry_points:
  value:
    - "server.ts (Backend execution via tsx server.ts)"
    - "src/main.tsx (Frontend execution via index.html)"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json"
    - "index.html"
  notes: ""

dangerous_areas:
  value:
    - "server.ts API key handling: Never log or expose process.env.GEMINI_API_KEY to client responses"
    - "CSV ingestion in DataTables.tsx: Ensure regex substitutions and user-uploaded data are safely sanitized"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "server.ts"
    - "src/components/DataTables.tsx"
  notes: ""

files_likely_to_change:
  value:
    - "src/components/*.tsx (UI iterations and new telemetry views)"
    - "src/data/scenarios.ts (Additional manufacturing line presets)"
    - "server.ts (Additional backend APIs or live driver integrations)"
  evidence_state: INFERRED
  confidence: HIGH
  evidence:
    - "TODO.md"
    - "ROADMAP.md"
  notes: ""

generated_files:
  value:
    - "dist/* (Production static build outputs and bundled dist/server.cjs)"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json (scripts.build)"
    - ".gitignore"
  notes: ""

repository_gaps:
  value:
    - "No automated unit/integration test suite configured in package.json"
    - "No persistent database layer (relies on in-memory state)"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json"
  notes: ""

known_unknowns:
  value:
    - "Production telemetry streaming throughput requirements for real-world high-frequency (100Hz+) factory lines"
  evidence_state: INFERRED
  confidence: MEDIUM
  evidence:
    - "src/components/ConnectedFactory.tsx"
  notes: ""

overall_confidence:
  value: HIGH
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "Direct source verification and successful build execution"
  notes: ""
