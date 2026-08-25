schema:
  version: 1
  compatible_with:
    - CCC
  generated_by: Repository Bootstrap Prompt
  generated_at: 2026-08-25T03:33:59-07:00
  repository: 60f9b35f-3fa3-433e-b53d-4fc316191fc8

generator:
  value: "Repository Bootstrap Prompt v1.0"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "System instructions"
  notes: ""

schema_version:
  value: 1
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "Output schema specification"
  notes: ""

generation_mode:
  value: "DETERMINISTIC"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "Evidence-backed YAML extraction"
  notes: ""

execution_mode:
  value: "DYNAMIC_AND_STATIC_VERIFICATION"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "lint_applet: tsc --noEmit executed successfully"
    - "compile_applet: vite build and esbuild server compilation executed successfully"
  notes: ""

detected_languages:
  value:
    - TypeScript
    - JavaScript
    - CSS
    - HTML
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "tsconfig.json"
    - "package.json"
    - "src/*.tsx"
    - "src/index.css"
    - "index.html"
  notes: ""

detected_frameworks:
  value:
    - React
    - Express
    - Tailwind CSS
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json"
  notes: ""

detected_build_system:
  value: Vite
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "vite.config.ts"
    - "package.json"
  notes: ""

detected_package_manager:
  value: npm
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package-lock.json"
    - "package.json"
  notes: "bun.lock also present in repository root."

files_analysed:
  value:
    - "/package.json"
    - "/tsconfig.json"
    - "/vite.config.ts"
    - "/metadata.json"
    - "/server.ts"
    - "/.env.example"
    - "/index.html"
    - "/src/main.tsx"
    - "/src/App.tsx"
    - "/src/index.css"
    - "/src/data/scenarios.ts"
    - "/src/components/ConnectedFactory.tsx"
    - "/src/components/DashboardCharts.tsx"
    - "/src/components/DataTables.tsx"
    - "/src/components/PlcCodeReview.tsx"
    - "/src/components/PrecursorDetection.tsx"
    - "/src/components/PricingPlans.tsx"
    - "/src/components/RootCauseReport.tsx"
    - "/src/components/ScenarioSelector.tsx"
    - "/src/components/TimelineAlignment.tsx"
    - "/TODO.md"
    - "/ROADMAP.md"
    - "/FACTORY_INSIGHT_AI.md"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "Direct file system tool reads"
  notes: ""

evidence_coverage:
  value: 98
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "23 source and configuration files directly read and verified"
  notes: "Score: 0-100 scale where 90-100 is Excellent"

unknown_coverage:
  value: 2
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "Testing runner script is UNSET due to absence in package.json"
  notes: ""

overall_confidence:
  value: HIGH
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "Complete file traversal, static analysis, linting, and compile execution verified"
  notes: ""

ccc_compatibility:
  value: true
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "Adherence to deterministic YAML schema specification"
  notes: ""

purpose:
  value: "Provide an evidence-backed, deterministic intermediate representation (IR) of the repository for human comprehension and automated agent/tooling ingestion."
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "User request specification"
  notes: ""
