# Project TODO and Action Items

## Critical Priorities
- [x] **API Key Guard Page Overlay**: Add a client-side API Key setup checker that gives clear warning overlays if the user has not loaded their `GEMINI_API_KEY`. (Completed: Added `/api/key-status` server check and a responsive in-app banner guide)
- [x] **Web Worker for Ingestion Parsing**: Offload CSV / JSON schema parsing inside `DataTables.tsx` to a standard browser Web Worker to avoid hanging main frame threads during large transfers. (Completed: Implemented dynamic Blob Worker with automatic main-thread fallback)

## High Priorities
- [x] **Data Decimation for Real-time Charts**: Slice or decimate long arrays of PLC events when feeding to Recharts container elements to keep page frame rates steady at 60fps on desktop/mobile. (Completed: Created custom `decimateAlarms` downsampler limiting active data point arrays to 1000 items)
- [x] **Report Local Caching**: Cache successfully compiled reports inside standard `localStorage` matching the scenario ID hash to prevent redundant API key credit consumption when clicking back and forth. (Completed: Built persistent analytical dataset hashing with automated state-restore triggers)

## Medium Priorities
- [x] **PDF/JSON Export Action Controls**: Implement an analytical data exporter giving raw printable reports of the aligned chronological sequence. (Completed: Integrated JSON file downloader and full-width print preview overlay modal using browser-native triggers)
- [x] **Continuous Integration (CI) configuration**: Create a `.github/workflows/verify.yml` pipeline triggering strict automated linter and tsc assertions upon every master branch pull-request. (Completed: Configured clean action pipeline running standard lint and type verification)

