schema:
  version: 1
  compatible_with:
    - CCC
  generated_by: Repository Bootstrap Prompt
  generated_at: 2026-08-25T03:33:59-07:00
  repository: 60f9b35f-3fa3-433e-b53d-4fc316191fc8

repository_type:
  value: WEB_APP
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json (dependencies: react, react-dom, express, vite)"
    - "src/App.tsx"
    - "src/main.tsx"
    - "server.ts"
  notes: "Full-stack web application with Express backend and React SPA frontend."

repository_status:
  value: ACTIVE
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "TODO.md completed milestones"
    - "Recent code commits across src/ and server.ts"
    - "Active build and lint passing"
  notes: ""

complexity:
  value: MODERATE
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "Full-stack server with API endpoints (/api/analyze, /api/opcua, /api/plc-review)"
    - "Multi-component client application with data visualization (recharts) and motion"
    - "Industrial domain logic for PLC alarms, SCADA protocols, and Gemini AI integration"
  notes: ""

primary_language:
  value: TypeScript
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "tsconfig.json"
    - "package.json (devDependencies: typescript ~5.8.2, tsx ^4.21.0)"
    - "*.ts and *.tsx source files in root and src/"
  notes: ""

secondary_languages:
  value:
    - JavaScript
    - CSS
    - HTML
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "index.html"
    - "src/index.css"
    - "vite.config.ts"
  notes: ""

primary_framework:
  value: React
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json (react ^19.0.1, @vitejs/plugin-react ^5.0.4)"
    - "src/main.tsx"
  notes: ""

build_system:
  value: Vite
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "vite.config.ts"
    - "package.json (scripts.build: vite build && esbuild ...)"
  notes: ""

package_manager:
  value: npm
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package-lock.json"
    - "package.json"
  notes: "bun.lock also present in root."

test_framework:
  value: UNSET
  evidence_state: UNSET
  confidence: NONE
  evidence: []
  notes: "No automated test framework (such as Vitest, Jest, Playwright) configured in package.json."

workspace_or_single_repository:
  value: SINGLE_REPOSITORY
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json (no workspaces field)"
    - "Single root tsconfig.json"
  notes: ""

repository_maturity:
  value: PROTOTYPE
  evidence_state: INFERRED
  confidence: HIGH
  evidence:
    - "package.json version 0.0.0"
    - "Mocked/simulated SCADA and OPC UA telemetry endpoints in server.ts"
    - "In-memory test scenarios in src/data/scenarios.ts"
  notes: ""

overall_confidence:
  value: HIGH
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "All codebase files directly inspected"
    - "Build and lint execution verified"
  notes: ""

evidence_summary:
  value:
    - "Full-stack TypeScript repository with Express server and React 19 frontend"
    - "Build passing via Vite and esbuild"
    - "TypeScript compilation passing without errors"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json"
    - "server.ts"
    - "src/App.tsx"
    - "lint_applet output: 0 errors"
    - "compile_applet output: Build succeeded"
  notes: ""

unknown_areas:
  value:
    - "Automated unit and integration test coverage"
    - "Production database persistence backend (uses in-memory/simulated data)"
  evidence_state: OBSERVED
  confidence: HIGH
  evidence:
    - "package.json scripts lack test command"
    - "server.ts does not connect to external persistent DB"
  notes: ""
