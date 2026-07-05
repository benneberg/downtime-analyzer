# Project TODO and Action Items

## Critical Priorities
- [ ] **API Key Guard Page Overlay**: Add a client-side API Key setup checker that gives clear warning overlays if the user has not loaded their `GEMINI_API_KEY`.
- [ ] **Web Worker for Ingestion Parsing**: Offload CSV / JSON schema parsing inside `DataTables.tsx` to a standard browser Web Worker to avoid hanging main frame threads during large transfers.

## High Priorities
- [ ] **Data Decimation for Real-time Charts**: Slice or decimate long arrays of PLC events when feeding to Recharts container elements to keep page frame rates steady at 60fps on desktop/mobile.
- [ ] **Report Local Caching**: Cache successfully compiled reports inside standard `localStorage` matching the scenario ID hash to prevent redundant API key credit consumption when clicking back and forth.

## Medium Priorities
- [ ] **PDF/JSON Export Action Controls**: Implement an analytical data exporter giving raw printable reports of the aligned chronological sequence.
- [ ] **Continuous Integration (CI) configuration**: Create a `.github/workflows/verify.yml` pipeline triggering strict automated linter and tsc assertions upon every master branch pull-request.
