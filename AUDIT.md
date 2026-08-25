schema:
  version: 1
  compatible_with:
    - CCC
  generated_by: Repository Bootstrap Prompt
  generated_at: 2026-08-25T03:33:59-07:00
  repository: 60f9b35f-3fa3-433e-b53d-4fc316191fc8

audit_results:
  correctness:
    - issue_id: "COR-01"
      title: "Type safety and build cleanliness"
      severity: "INFO"
      evidence:
        - "tsc --noEmit passed with 0 errors"
        - "vite build and esbuild compilation succeeded without errors"
      impact: "Application builds cleanly and executes without runtime type discrepancies."
      recommendation: "Maintain strict TypeScript configuration."
      confidence: "HIGH"

  security:
    - issue_id: "SEC-01"
      title: "Server-side API key isolation"
      severity: "INFO"
      evidence:
        - "GEMINI_API_KEY is read exclusively in server.ts via process.env.GEMINI_API_KEY"
        - "No VITE_ prefixed API keys present in client source files"
      impact: "Protects sensitive AI credentials from browser exposure."
      recommendation: "Continue isolating all secret API keys within backend routes."
      confidence: "HIGH"
    - issue_id: "SEC-02"
      title: "Input sanitization on user regex substitution in CSV ingestion"
      severity: "LOW"
      evidence:
        - "src/components/DataTables.tsx executes client-side RegExp constructor on user-provided pattern"
      impact: "Malformed user regex strings could cause client-side uncaught exception or ReDoS on large text files."
      recommendation: "Wrap client-side RegExp instantiation in try/catch blocks with syntax validation."
      confidence: "HIGH"

  dependencies:
    - issue_id: "DEP-01"
      title: "Up-to-date modern dependency stack"
      severity: "INFO"
      evidence:
        - "react ^19.0.1, @google/genai ^2.4.0, tailwindcss ^4.1.14, vite ^6.2.3 in package.json"
      impact: "Leverages latest security patches and performance improvements."
      recommendation: "Regularly run npm audit to monitor upstream security notices."
      confidence: "HIGH"

  performance:
    - issue_id: "PERF-01"
      title: "Telemetry downsampling and memoization in charts"
      severity: "INFO"
      evidence:
        - "DashboardCharts.tsx downsamples large event streams (>1,000 items) to prevent canvas frame drops"
        - "Memoized statistical anomaly calculation (Z-score and density)"
      impact: "Maintains smooth 60fps rendering during interactive telemetry navigation."
      recommendation: "Maintain downsampling algorithms for long historical log series."
      confidence: "HIGH"

  maintainability:
    - issue_id: "MAINT-01"
      title: "Clean component modularity and separation of concerns"
      severity: "INFO"
      evidence:
        - "Components separated into src/components/ with distinct responsibilities"
        - "Preset domain datasets cleanly extracted to src/data/scenarios.ts"
      impact: "Facilitates isolated enhancements and easy debugging."
      recommendation: "Extract common TypeScript types into a dedicated src/types.ts file as codebase grows."
      confidence: "HIGH"

  code_quality:
    - issue_id: "QUAL-01"
      title: "Consistent Hungarian notation and IEC 61131-3 linting"
      severity: "INFO"
      evidence:
        - "Static analysis algorithms in PlcCodeReview.tsx enforce strict prefix rules and dead-code detection"
      impact: "Provides high domain utility for industrial control systems."
      recommendation: "Expand parser to support full IEC 61131-3 Function Block Diagram (FBD) XML exports."
      confidence: "HIGH"

  technical_debt:
    - issue_id: "DEBT-01"
      title: "In-memory state management for telemetry records"
      severity: "MEDIUM"
      evidence:
        - "src/App.tsx stores all alarm, log, and work order records in React useState hooks"
      impact: "User modifications and newly ingested CSV logs reset upon page refresh unless exported to JSON."
      recommendation: "Implement localStorage caching or cloud persistence (Firestore / Cloud SQL)."
      confidence: "HIGH"

  observability:
    - issue_id: "OBS-01"
      title: "Interactive live terminal and log inspection"
      severity: "INFO"
      evidence:
        - "ConnectedFactory.tsx provides real-time terminal output for simulated OPC UA / MQTT packets"
      impact: "Provides immediate visual feedback during protocol debugging."
      recommendation: "Add structured server-side request logging with Winston or Morgan in server.ts."
      confidence: "MEDIUM"

  testing:
    - issue_id: "TEST-01"
      title: "Absence of automated unit and end-to-end test runners"
      severity: "MEDIUM"
      evidence:
        - "package.json lacks a 'test' script and testing dependencies (vitest, jest, @testing-library/react)"
      impact: "Code changes rely on static type checking (tsc) and manual verification."
      recommendation: "Install vitest and write unit tests for ISA-18.2 statistical math, Hungarian notation parser, and CSV cleaner."
      confidence: "HIGH"

  documentation:
    - issue_id: "DOC-01"
      title: "Comprehensive repository documentation"
      severity: "INFO"
      evidence:
        - "README.md, FACTORY_INSIGHT_AI.md, ROADMAP.md, and TODO.md detail features, architectures, and roadmap"
      impact: "Clear onboarding and technical transparency."
      recommendation: "Keep README synchronized with new protocol additions."
      confidence: "HIGH"

  ci_cd:
    - issue_id: "CICD-01"
      title: "Standardized container build configuration"
      severity: "INFO"
      evidence:
        - "package.json build script outputs bundled dist/server.cjs and static dist/"
        - "Start script executes single standalone node command"
      impact: "Enables zero-dependency Cloud Run / Docker deployments."
      recommendation: "Maintain standalone bundled server output."
      confidence: "HIGH"
