# System Architecture

> Canonical architectural specification, system components, data flows, and technical invariants for Factory Insight AI.

---

## 1. High-Level Architecture Overview

Factory Insight AI is built as a single-process full-stack application pairing an **Express (Node.js)** backend with a **React 19 (Vite)** single-page application (SPA). 

In development mode, Express mounts Vite middleware directly for hot-reloading. In production, Vite compiles client assets to `dist/` and `esbuild` bundles `server.ts` into a self-contained CommonJS artifact (`dist/server.cjs`), allowing the entire application to run inside a zero-dependency container on port 3000.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client (Browser)                              │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    App.tsx (Main Shell & Hub)                     │  │
│  │   • Module Routing: Downtime | PLC Review | Connected Factory     │  │
│  │   • Role State: ADMIN | ANALYST | VIEWER                          │  │
│  │   • Active Scenario & Event Streams (In-Memory React State)      │  │
│  └──────┬──────────────────────┬──────────────────────┬─────────────┘  │
│         │                      │                      │                │
│         ▼                      ▼                      ▼                │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐        │
│  │   Downtime   │       │   PLC Code   │       │  Connected   │        │
│  │   Analyzer   │       │    Review    │       │   Factory    │        │
│  │  (Precursors,│       │ (IEC 61131-3 │       │  (OPC UA &   │        │
│  │  Timeline,   │       │   Linter &   │       │   Sparkplug  │        │
│  │  5-Whys AI)  │       │  Diff Tool)  │       │  Telemetry)  │        │
│  └──────┬───────┘       └──────┬───────┘       └──────┬───────┘        │
└─────────┼──────────────────────┼──────────────────────┼────────────────┘
          │                      │                      │
          │ POST /api/analyze    │ POST /api/plc-review │ GET/POST /api/opcua/*
          ▼                      ▼                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Backend (server.ts)                             │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                       Express API Gateway                        │  │
│  │   • Body Parser: 10MB JSON/URL-encoded payload limit              │  │
│  │   • Key Checker: GET /api/key-status                             │  │
│  └──────┬──────────────────────┬──────────────────────┬─────────────┘  │
│         │                      │                      │                │
│         ▼                      ▼                      ▼                │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐        │
│  │  Gemini 3.5  │       │  Gemini 3.5  │       │    OPC UA    │        │
│  │ Flash Proxy  │       │ Safety Audit │       │  Simulation  │        │
│  │  + Heuristic │       │  + Heuristic │       │    Engine    │        │
│  │   Fallback   │       │   Fallback   │       │              │        │
│  └──────┬───────┘       └──────┬───────┘       └──────────────┘        │
│         │                      │                                       │
│         ▼                      ▼                                       │
│  ┌─────────────────────────────────────┐                               │
│  │ Google GenAI API (@google/genai)    │                               │
│  │ Process-isolated GEMINI_API_KEY     │                               │
│  └─────────────────────────────────────┘                               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. System Components & Responsibilities

### 2.1 Backend Server (`server.ts`)
- **API Gateway**: Provides REST endpoints for AI generation, code auditing, and industrial protocol simulation.
- **Credential Isolation**: Reads `process.env.GEMINI_API_KEY` exclusively on the server. The key is never exposed to the client.
- **Model Fallback Engine**: If `GEMINI_API_KEY` is missing or invalid, routes return deterministic static/heuristic analyses instead of failing.
- **Vite Integration**:
  - *Development*: Instantiates Vite in middleware mode (`appType: "spa"`).
  - *Production*: Serves pre-compiled static assets from `dist/` and routes all non-API paths to `dist/index.html`.
- **Ingress Constraint**: Binds strictly to `0.0.0.0:3000` to satisfy container ingress routing.

### 2.2 Frontend Shell (`src/App.tsx`)
- **Module Orchestration**: Houses the primary navigation switcher between the three functional modules:
  1. `downtime`: Downtime Analyzer Suite
  2. `plc_review`: IEC 61131-3 PLC Code Reviewer
  3. `connected_factory`: SCADA / Live Protocol Bridge
- **Role-Based Access Control (RBAC)**: Enforces simulated security permissions (`ADMIN`, `ANALYST`, `VIEWER`) across operational buttons and modification forms.
- **State Hub**: Maintains active working sets of `PLCAlarm[]`, `OperatorLog[]`, `MaintenanceEvent[]`, and `ProductionStop[]`.

### 2.3 Downtime Analysis Components
- **`ScenarioSelector.tsx`**: Provides instant switching across preloaded manufacturing incidents (`Bottling Line`, `Packaging Sealer`, `CNC Cell`).
- **`RootCauseReport.tsx`**: Dispatches synchronized event data to `/api/analyze` and formats the returned executive summary, 5-Whys chain, confidence scores, and CAPA matrix. Includes local cache hashing and print/PDF generation.
- **`PrecursorDetection.tsx`**: Performs client-side mathematical delta analysis between alarm timestamps and stop event start-times to isolate precursors within `< 2m`, `< 5m`, and `< 10m` windows.
- **`TimelineAlignment.tsx`**: Normalizes timestamps across heterogeneous sources into an ISO-8601 millisecond-aligned chronological stream. Features a timeline scrubber and live synchronized telemetry gauges.
- **`DashboardCharts.tsx`**: Visualizes time-series event densities using Recharts. Implements data decimation (`decimateAlarms`) when event counts exceed 1,000 items to maintain 60fps frame rates, and computes ISA-18.2 Z-score anomalies.
- **`DataTables.tsx`**: Provides tabbed CRUD record editing and CSV file ingestion. Uses a browser Web Worker for off-thread parsing, with custom header mapping, timestamp timezone adjustment, and regex substitutions.

### 2.4 PLC Code Reviewer (`PlcCodeReview.tsx`)
- **Static Parser**: Evaluates Structured Text for IEC 61131-3 Hungarian notation compliance (`b`, `n`, `f`, `s`, `t`, `fb`, `g_`, `c_` prefixes) and dead code reachability.
- **Safety Analyzer**: Calls `/api/plc-review` to audit hardware E-stop latching, dual-channel safety relays, and operational bypasses.
- **Interactive Diff Viewer**: Renders side-by-side comparisons of original versus refactored Structured Text with 1-click replacement.

### 2.5 SCADA / Connected Factory Bridge (`ConnectedFactory.tsx`)
- **OPC UA Address Space Browser**: Simulates a live industrial server (`opc.tcp://192.168.1.120:4840`), exposing nodes for motor currents, vibrations, photo-eyes, temperatures, and safety relays.
- **Polling Loop**: Executes periodic calls to `/api/opcua/poll`, returning simulated real-time telemetry fluctuations and generating live alarm events that feed directly into the root cause analysis stream.
- **MQTT Sparkplug B Client**: Decodes simulated low-bandwidth industrial payload packets with status indicators.

---

## 3. Data Flow

### 3.1 Event Ingestion and Normalization
```
[User CSV Upload / Manual Form / Preset Scenario / OPC UA Live Poll]
                                 │
                                 ▼
                     [Web Worker CSV / JSON Parser]
                                 │
                                 ▼
                    [In-Memory React State Container]
              (PLCAlarm, OperatorLog, Maintenance, Stop)
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
 [Precursor Time Scanner]                   [Sequence Timeline Engine]
 Identifies alarms in                       Aligns events chronologically
 - 2m window                                with relative T-minus offsets
 - 5m window                                to stoppage start-time
 - 10m window
```

### 3.2 AI Analysis Pipeline
```
[In-Memory Event Collections]
             │
             ▼
[POST /api/analyze Payload]
             │
             ▼
[Backend Gemini 3.5 Flash Client]
  • System instructions (Reliability Engineer & Root Cause Specialist)
  • Industrial events serialized into prompt
  • JSON mode enforced (responseMimeType: "application/json")
             │
      ┌──────┴───────────────────────────┐
      ▼                                  ▼
[API Key Available]              [API Key Absent / Invalid]
Executes Gemini generateContent  Executes deterministic offline heuristic
Returns structured 5-Whys JSON   Returns rule-based 5-Whys analysis
      │                                  │
      └──────────────────┬───────────────┘
                         ▼
             [Parsed JSON Response]
  - Executive Summary
  - 5-Whys chain
  - Likely causes (category, confidence, evidence)
  - Recommended CAPA actions (Immediate, Corrective, Preventive)
  - Precursor alarm warnings
                         │
                         ▼
        [Client RootCauseReport Presentation]
```

---

## 4. Architectural Invariants & Constraints

1. **Port & Host Binding**:
   - The application MUST bind to port `3000` and host `0.0.0.0`. Port 3000 is the only externally accessible port in container environments.
2. **API Key Containment**:
   - `GEMINI_API_KEY` MUST NEVER be prefixed with `VITE_` or sent in client responses. All AI model interactions must be proxied via `/api/*`.
3. **Graceful Offline Fallback**:
   - All AI endpoints (`/api/analyze`, `/api/plc-review`) MUST provide deterministic offline heuristic fallbacks. The application must remain fully functional and interactive even when no API key is provided.
4. **Frame Rate & Telemetry Decimation**:
   - Chart components MUST downsample event streams when array lengths exceed 1,000 items (`decimateAlarms`), preventing browser UI freezing during large data visualizations.
5. **Payload Size Boundaries**:
   - Express body parsing is explicitly configured to a `10mb` ceiling to accommodate large CSV log uploads while protecting against heap exhaustion.
6. **Stateless Backend Design**:
   - The Express backend maintains no in-memory session stores or local database tables. All event streams are passed per-request from client state.

---

## 5. API Route Specifications

| Endpoint | Method | Request Payload | Response Schema | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/key-status` | `GET` | *None* | `{ configured: boolean }` | Checks if `GEMINI_API_KEY` is loaded and valid. |
| `/api/analyze` | `POST` | `{ plcAlarms, operatorLogs, maintenanceEvents, productionStops }` | `{ report: { executiveSummary, fiveWhys, likelyCauses, recommendedActions, precursorAlert } }` | Correlates event streams into a 5-Whys diagnostic report. |
| `/api/opcua/nodes` | `GET` | *None* | `{ serverUri, serverName, securityPolicy, connectionStatus, nodes: Node[] }` | Returns simulated OPC UA server node hierarchy. |
| `/api/opcua/poll` | `POST` | `{ nodeIds: string[] }` | `{ polledAt, polledValues: Value[], generatedAlarms: Alarm[] }` | Simulates telemetry polling and generates condition-based alarms. |
| `/api/plc-review` | `POST` | `{ code: string, targetController?: string, standard?: string }` | `{ audit: { score, standardsCompliance, controllerTarget, summary, issues, refactoredCode } }` | Performs static and AI safety audits on Structured Text code. |

---

## 6. State Management & Persistence

- **Primary State**: Single-session in-memory React state (`useState`) managed in `App.tsx`.
- **Preloaded Data**: Static reference manufacturing datasets defined in `src/data/scenarios.ts`.
- **Local Caching**: Generated root cause reports are cached in the browser's `localStorage` indexed by a hash of the current event dataset, preventing redundant API calls when navigating between views.
- **Persistence Boundary**: The repository does not include an external database service (e.g. Firestore or PostgreSQL). Users can persist and restore state via JSON export and import in `DataTables.tsx`.

---

## 7. Verification & Testing Boundaries

- **Static Type Safety**: Verified through `npm run lint` (`tsc --noEmit`), enforcing zero TypeScript type errors.
- **Bundle Compilation**: Verified through `npm run build`, executing Vite client bundling and esbuild backend packaging.
- **Test Suite Status**: There is currently no automated unit test runner (e.g., Vitest) configured in `package.json`. Verification boundaries rely on compiler checks, type assertions, and manual scenario execution.
