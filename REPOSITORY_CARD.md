schema:
  version: 1
  compatible_with:
    - CCC
  generated_by: Repository Bootstrap Prompt
  generated_at: 2026-08-25T03:33:59-07:00
  repository: 60f9b35f-3fa3-433e-b53d-4fc316191fc8

name:
  value: "Factory Insight AI (Downtime Analyzer)"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "metadata.json (name: Factory Insight AI)"
    - "README.md (# Downtime Analyzer (Factory Insight AI))"
    - "src/App.tsx (Factory Insight AI Industrial Suite v2.0)"
  notes: ""

short_description:
  value: "Industrial analytics platform correlating PLC alarms, operator logs, and maintenance events for automated 5-Whys root cause analysis, PLC code review, and SCADA monitoring."
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "metadata.json"
    - "README.md"
    - "src/App.tsx"
  notes: ""

category:
  value: "Industrial Automation & Manufacturing Analytics"
  evidence_state: INFERRED
  confidence: HIGH
  evidence:
    - "src/data/scenarios.ts (PLC alarms, industrial packaging/bottling scenarios)"
    - "server.ts (OPC UA, PLC review, industrial downtime analysis)"
  notes: ""

repository_type:
  value: WEB_APP
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json (express, vite, react)"
    - "server.ts"
    - "src/App.tsx"
  notes: ""

repository_status:
  value: ACTIVE
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "TODO.md completed items"
    - "Passing builds and linter"
  notes: ""

complexity:
  value: MODERATE
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "Express backend with Gemini API proxy and OPC UA / PLC review simulation"
    - "React frontend with Recharts, Motion, custom CSV parsers, and multi-protocol dashboards"
  notes: ""

primary_technologies:
  value:
    - TypeScript
    - React 19
    - Vite
    - Express
    - Tailwind CSS
    - Google GenAI SDK (@google/genai)
    - Recharts
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json dependencies"
  notes: ""

problem_solved:
  value: "Bridges the gap between industrial machine telemetry (PLC alarm codes) and manual operational logs to automate downtime diagnostics, eliminate intermittent micro-stops, and audit PLC logic safety."
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "README.md"
    - "FACTORY_INSIGHT_AI.md"
    - "src/components/RootCauseReport.tsx"
    - "src/components/PlcCodeReview.tsx"
  notes: ""

target_audience:
  value: "Manufacturing plant managers, controls engineers, reliability analysts, and maintenance supervisors."
  evidence_state: INFERRED
  confidence: HIGH
  evidence:
    - "README.md"
    - "src/components/PricingPlans.tsx"
    - "src/components/ConnectedFactory.tsx (RBAC roles: Admin, Analyst, Viewer)"
  notes: ""

primary_users:
  value:
    - Controls Engineers
    - Reliability Analysts
    - Shift Supervisors
    - Maintenance Technicians
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "src/components/ConnectedFactory.tsx"
    - "src/components/PricingPlans.tsx"
  notes: ""

unique_characteristics:
  value:
    - "Unified millisecond-aligned cross-system timeline integrating PLC alarms, operator logs, and work orders"
    - "Precursor failure signature detection engine identifying early alarm chatter prior to emergency stops"
    - "Statistical baseline anomaly detector grounded in ISA-18.2 standards"
    - "Built-in IEC 61131-3 Structured Text static analyzer and AI safety auditor with 1-click code remediation"
    - "Interactive OPC UA server bridge and MQTT Sparkplug B telemetry decoder"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "src/components/TimelineAlignment.tsx"
    - "src/components/PrecursorDetection.tsx"
    - "src/components/DashboardCharts.tsx"
    - "src/components/PlcCodeReview.tsx"
    - "src/components/ConnectedFactory.tsx"
  notes: ""

primary_entry_points:
  value:
    - "server.ts (Express backend entry point)"
    - "src/main.tsx (React client entry point)"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json (scripts.dev: tsx server.ts)"
    - "index.html (script src=/src/main.tsx)"
  notes: ""

current_state:
  value: "Fully functional prototype with working client-server architecture, offline heuristic analysis engines, and live Gemini AI integration when API key is provided."
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "server.ts (/api/analyze, /api/plc-review, /api/opcua endpoints)"
    - "Build verification: clean build, no TypeScript errors"
  notes: ""

key_risks:
  value:
    - "Lack of automated unit/integration tests in CI/CD pipeline"
    - "Dependency on GEMINI_API_KEY for live AI generation (mitigated by offline heuristic fallbacks)"
    - "Telemetry connections currently operate in simulated/mocked mode without native socket driver"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json (no test runner script)"
    - "server.ts fallback handlers when GEMINI_API_KEY is unset"
  notes: ""

overall_confidence:
  value: HIGH
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "Full codebase verified by direct file reads and execution tools"
  notes: ""
