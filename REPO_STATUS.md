# Repository Status (Downtime Analyzer)

## One-Line Summary
An advanced full-stack React and Express industrial monitoring and analysis engine with real-time PLC alarm correlation, event-sequence timeline alignment, and automated Gemini 3.5-powered root-cause reports.

## Persona and Use Case
- **Target Persona**: Reliability Engineer, Maintenance Manager, Plant Operator, Continuous Improvement Lead.
- **Core Use Case**: Explaining unexpected factory line downtime by correlating physical sensor telemetry/PLC logs with manual shift notes and technician maintenance actions.

## Status Scores (0-100)
- **Correctness**: **95/100** (Full state machine synchronizing preloaded industrial scenarios and manual/CSV input, but client-side alignment assumes exact ISO timestamps)
- **Security**: **92/100** (Gemini API key is processed strictly server-side; request limits are restricted, though raw CSV processing is client-side)
- **Dependencies**: **95/100** (Modern stack using Vite, React 19, Recharts, Express, and official `@google/genai` package with no legacy SDK bloat)
- **Performance**: **90/100** (Optimized React rendering with modularized child components, but huge CSV logs could cause layout rendering bottlenecks if not chunked)
- **Observability**: **85/100** (Server logs connection info, errors, and JSON parser issues; client has extensive user-facing alert bars)
- **CI/CD**: **80/100** (Vite build bundler compiles TypeScript down to standard ES bundle for production with strict lint/tsc checks, but lacks pre-commit automated testing suites)
- **Code Quality**: **95/100** (Highly modularized structure, strict TypeScript types in `src/types.ts` / `src/data/scenarios.ts`, cohesive tailwind industrial palette styling)
- **Incomplete Work**: **90/100** (Fully complete industrial downtime application, with future SCADA connectors mapped out in roadmaps)

## Security Notes
- Direct server-side API proxy prevents exposing the Gemini API key to the client browser.
- No `eval` or unsafe `dangerouslySetInnerHTML` patterns observed.
- Server payload limit is capped at 10mb for CSV data stream ingestion.

## Full Audit Required?
- **No**. The system builds successfully, executes linting cleanly, and the API boundaries are properly enforced.

## Top 3 Actions Needed
1. **Local CSV Chunking/Web Worker**: Ensure client-side parsing of large industrial CSV files (>50,000 logs) runs on a background worker thread.
2. **Server-Side API Key Status Check**: Return a structural status indicating whether a key is configured so the UI can prompt the user instantly without waiting for a request failure.
3. **UTC Normalization Guard**: Enforce strict ISO-8601 formatting on the client-side log adding forms to avoid time-zone mismatches during precursor scanning.

## Unknowns
- Behavioral latency of client rendering under continuous multi-megabyte log ingestion streams.
- Level of reliability of Gemini 3.5 Flash output when custom structured text files contain vendor-specific, non-standard timestamp structures.
