# System Architecture Specification

## 1. Core Architectural Components
The application is structured as a full-stack monolithic container architecture running a React 19 Single Page Application on the client and an Express Node.js application on the server.
- **Client Application (Vite + React)**:
  * `App.tsx`: Main application coordinator, houses root state indices.
  * `ScenarioSelector.tsx`: Renders buttons allowing users to select or reset preloaded scenario states.
  * `DashboardCharts.tsx`: Implements SVG layouts and Recharts displays representing active alarms.
  * `PrecursorDetection.tsx`: Computes statistical precursor patterns.
  * `TimelineAlignment.tsx`: Chronologically aligns mixed hardware and human records with specific offset indicators.
  * `DataTables.tsx`: Displays interactive tables allowing file drops, CSV normalization, and direct log adjustments.
  * `RootCauseReport.tsx`: Displays loading flows, parses, and formats the Gemini report responses.
- **Backend Server (Express)**:
  * `server.ts`: Entry point. Mounts Vite development middleware in non-production environments and hosts static `dist/` production assets. Exposes `/api/analyze` for Gemini processing.

*(Confidence: **High**)*

## 2. System Data Flow
The system operates on an active in-memory React state hierarchy representing the underlying industrial logs.
- **Source of Truth**:
  * **Primary**: Local client-side state inside `App.tsx` (`plcAlarms`, `operatorLogs`, `maintenanceEvents`, `productionStops`). When a user edits table entries or drops new files, this state is mutated.
  * **Secondary / Reference**: Pre-packaged scenarios defined in `src/data/scenarios.ts`.
- **API Request Lifecycle**:
  1. Operator clicks "Generate AI Root Cause Report" in `RootCauseReport.tsx`.
  2. Client-side logs are bundled into a request body payload and POSTed to `/api/analyze`.
  3. Backend Express server parses the request body and constructs a comprehensive structured reliability-engineering prompt.
  4. Prompt is dispatched to `gemini-3.5-flash` model.
  5. Gemini outputs JSON matching the predefined structural contract.
  6. Server parses/validates the JSON schema and returns it to the UI for immediate high-contrast rendering.

*(Confidence: **High**)*

## 3. Integrations
- **AI Integration**: Integrates with Google GenAI SDK (`@google/genai`) to call `gemini-3.5-flash` for high-speed analysis.
- **Industrial Integrations (Roadmap)**: Future connectors are mapped for OPC UA, MQTT, and Ignition.

*(Confidence: **High**)*

## 4. Deployment Model
- **Platform**: Designed to run inside standardized Docker/OCI containers on serverless platforms such as Cloud Run.
- **Port Binding**: Binds directly to port `3000` on host `0.0.0.0` as routed by the container ingress reverse-proxy.
- **Build Output**: Compiles client-side static bundles to `dist/` and compiles server-side code to a standalone CommonJS bundle (`dist/server.cjs`).

*(Confidence: **High**)*

## 5. Observability
- **Backend Logging**: Direct stdout logs noting server binding ports, environment variables, and raw API errors.
- **Client Error Boundary**: Catch-blocks displaying real-time UI alerts, informing users of configuration issues or incorrect file schemas.

*(Confidence: **Medium** - Needs a centralized database log system)*

## 6. System Risks
- **Rate-Limiting / Token Exhaustion**: Huge log uploads could hit token boundaries if arrays are not filtered or decimated before dispatching to the Gemini context window.
- **Client Performance Degradation**: Browser rendering of large arrays of logs directly inside the DOM can cause UI lagging.

*(Confidence: **High**)*

## 7. Recommended Improvements
- **Prompt Token Guard**: Add server-side check cutting log arrays to the latest 100 relevant entries if payload exceeds specific boundaries.
- **Debounced Chart Calculations**: Ensure Recharts are only redrawn when a user stops modifying manual logs.

*(Confidence: **High**)*
