# Project TODO and Action Items

## Completed Priorities
- [x] **API Key Guard Page Overlay**: Add a client-side API Key setup checker that gives clear warning overlays if the user has not loaded their `GEMINI_API_KEY`. (Completed: Added `/api/key-status` server check and a responsive in-app banner guide)
- [x] **Web Worker for Ingestion Parsing**: Offload CSV / JSON schema parsing inside `DataTables.tsx` to a standard browser Web Worker to avoid hanging main frame threads during large transfers. (Completed: Implemented dynamic Blob Worker with automatic main-thread fallback)
- [x] **Data Decimation for Real-time Charts**: Slice or decimate long arrays of PLC events when feeding to Recharts container elements to keep page frame rates steady at 60fps on desktop/mobile. (Completed: Created custom `decimateAlarms` downsampler limiting active data point arrays to 1000 items)
- [x] **Report Local Caching**: Cache successfully compiled reports inside standard `localStorage` matching the scenario ID hash to prevent redundant API key credit consumption when clicking back and forth. (Completed: Built persistent analytical dataset hashing with automated state-restore triggers)
- [x] **PDF/JSON Export Action Controls**: Implement an analytical data exporter giving raw printable reports of the aligned chronological sequence. (Completed: Integrated JSON file downloader and full-width print preview overlay modal using browser-native triggers)
- [x] **Continuous Integration (CI) configuration**: Create a `.github/workflows/verify.yml` pipeline triggering strict automated linter and tsc assertions upon every master branch pull-request. (Completed: Configured clean action pipeline running standard lint and type verification)

---

## Future Roadmap Milestones (From ROADMAP.md)

### Phase 2: Downtime Analyzer - Advanced Analytics & UX
- [x] **Interactive Timeline Replay Controller**: Build a visual playback scrubber allowing operators to replay historical incidents minute-by-minute with synchronized gauge indicators. (Completed: Implemented dynamic timeline playback controls, scrubber, and synchronized telemetry widgets)
- [x] **Shift-Change Transition Fatigue Predictor**: Run statistics correlating stoppage frequencies against operator changeovers, identifying high-risk transition fatigue windows. (Completed: Designed shift-correlation logic & visual threat gauge dashboard correlating morning, afternoon, and night transitions)
- [x] **Advanced CSV Log Cleaning Utility**: Create client-side UI parser rules allowing custom log-header mapping, value substitutions, and automated timezone adjustments. (Completed: Created collapsible Ingestion Rules dashboard with custom mapping fields, offset selection, and regex substitutions)

### Phase 3: Connected Factory (SCADA & Live Ingestion Mockup)
- [ ] **OPC UA Server Connector Bridge**: Establish a dummy backend module capable of registering local variables and simulating direct hardware register polling from Siemens S7 or Beckhoff TwinCAT.
- [ ] **MQTT broker Sparkplug B Client**: Implement an internal broker sub-client to subscribe and display low-bandwidth sensor telemetry payloads.
- [ ] **Role-Based Workspace Configuration**: Set up simulated authentication gates (Admin vs Analyst vs Viewer) adjusting action buttons and write permissions accordingly.

### Project 1: PLC Code Review Module (Parallel SaaS Expansion)
- [ ] **Structured Text (ST) Code Ingestion Gate**: Construct an upload card accepting raw `.st` / `.xml` files.
- [ ] **IEC 61131-3 Naming & Style Validator**: Design static analysis algorithms verifying tag naming structures against global standards.
- [ ] **Safety & Dead Code AI Auditing**: Incorporate a specialized Gemini prompt agent detecting unreached code fragments and non-fail-safe branch patterns.


