schema:
  version: 1
  compatible_with:
    - CCC
  generated_by: Repository Bootstrap Prompt
  generated_at: 2026-08-25T03:33:59-07:00
  repository: 60f9b35f-3fa3-433e-b53d-4fc316191fc8

actions:
  immediate:
    - title: "Sanitize and safely guard user-provided regex in CSV ingestion"
      description: "Wrap RegExp instantiation in try/catch within src/components/DataTables.tsx to prevent invalid expression syntax from crashing client log parsing."
      priority: "CRITICAL"
      expected_benefit: "Prevents UI unhandled exceptions when users enter malformed regex filter rules."
      difficulty: "LOW"
      evidence:
        - "src/components/DataTables.tsx (new RegExp(rule.searchPattern, 'g'))"
      confidence: "HIGH"

  high_priority:
    - title: "Implement Automated Testing Suite (Vitest)"
      description: "Install vitest and @testing-library/react to automate regression testing for ISA-18.2 anomaly detection algorithms, Hungarian notation linting, and 5-Whys heuristic generators."
      priority: "HIGH"
      expected_benefit: "Ensures mathematical and parsing accuracy across code modifications."
      difficulty: "MEDIUM"
      evidence:
        - "package.json (no test script currently defined)"
      confidence: "HIGH"

  medium_priority:
    - title: "Add LocalStorage / IndexedDB persistence for offline sessions"
      description: "Persist uploaded CSV logs, custom PLC code snippets, and generated 5-Whys reports to browser storage so user changes survive full page refreshes."
      priority: "MEDIUM"
      expected_benefit: "Improves user retention and prevents accidental data loss during active investigation sessions."
      difficulty: "LOW"
      evidence:
        - "src/App.tsx (useState without localStorage persistence layer)"
      confidence: "HIGH"

  low_priority:
    - title: "Expand PLC Structured Text dialect support"
      description: "Add parser definitions and sample templates for Omron Sysmac Studio and Mitsubishi GX Works3 Structured Text dialects."
      priority: "LOW"
      expected_benefit: "Broadens compatibility across Asian manufacturing environments."
      difficulty: "LOW"
      evidence:
        - "src/components/PlcCodeReview.tsx (currently supports Siemens S7, Beckhoff TwinCAT, Rockwell Studio 5000)"
      confidence: "HIGH"

  quick_wins:
    - title: "Centralize Shared TypeScript Types"
      description: "Extract common interfaces (PLCAlarm, OperatorLog, MaintenanceEvent, ProductionStop, OpcUaNode, SparkplugMessage) into a shared src/types.ts file."
      priority: "LOW"
      expected_benefit: "Reduces interface duplication across components and improves IDE auto-completion."
      difficulty: "LOW"
      evidence:
        - "src/data/scenarios.ts, src/components/ConnectedFactory.tsx, src/components/PlcCodeReview.tsx"
      confidence: "HIGH"

  long_term:
    - title: "Durable Cloud Database & Native Industrial Protocol Drivers"
      description: "Integrate Firestore or PostgreSQL for multi-tenant multi-line data retention, and provide a native Node.js OPC UA / MQTT gateway service for on-premise edge deployments."
      priority: "MEDIUM"
      expected_benefit: "Enables production deployment in real-world enterprise plant architectures."
      difficulty: "HIGH"
      evidence:
        - "ROADMAP.md (Phase 4 & Phase 5 goals)"
      confidence: "HIGH"
