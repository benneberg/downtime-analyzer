# Downtime Analyzer (Factory Insight AI)

## Overview
The **Downtime Analyzer** (Factory Insight AI) is an advanced full-stack manufacturing analytics and automation suite that combines real-time PLC alarms, operator logs, maintenance records, and production events to identify the true root causes of equipment downtime. It correlates disparate data streams and generates structured "5 Whys" reports via `gemini-3.5-flash`, complete with pre-commissioning PLC Structured Text code auditing and live OPC UA / MQTT Sparkplug B SCADA connectivity.

---

## Core Capabilities & Modules

1. **Downtime Analyzer & 5-Whys AI Synthesizer**:
   - **Chronological Sequence Alignment**: Correlates PLC registers, operator handovers, and work orders on a unified millisecond timeline.
   - **Precursor Detection Engine**: Identifies chatter and early failure signatures `< 2m`, `< 5m`, or `< 10m` before emergency stops.
   - **Statistical Anomaly Alert Badge**: Detects deviations in incoming alarm density and critical severity against ISA-18.2 benchmarks.
   - **Shift Transition Fatigue Predictor**: Analyzes shift-change intervals to highlight vulnerability periods during operator handovers.

2. **PLC Code Reviewer (IEC 61131-3 & Safety Auditor)**:
   - **Structured Text (ST) & PLCopen XML Gate**: Ingests and edits `.st`, `.xml`, `.exp`, and `.txt` logic for Siemens S7-1500, Beckhoff TwinCAT, and Rockwell ControlLogix.
   - **Static Hungarian Notation Validator**: Enforces strict prefix conventions (`b`, `n`, `f`, `s`, `t`, `fb`, `g_`, `c_`).
   - **AI Safety & Dead Code Auditor**: Pinpoints missing E-Stop circuits, unlatched outputs, race conditions, and provides 1-Click Code Diff Auto-fixes.

3. **Connected Factory (SCADA & Industrial IoT Bridge)**:
   - **OPC UA Server Connector**: Real-time address space browsing and register polling (`opc.tcp://...`) with live event injection into analytical streams.
   - **MQTT Sparkplug B Client**: Decodes payload metrics (Vibration RMS, Motor Current, Digital States) from plant broker streams.
   - **Role-Based Access Control (RBAC)**: Simulated security tiers (Admin, Analyst, Viewer) managing mutation, deletion, and AI execution rights.


---

## Installation

1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Secrets**:
   Create a `.env` file or set the secret in your container environment:
   ```env
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   ```

---

## Usage

1. **Run Development Server**:
   ```bash
   npm run dev
   ```
   This boots the backend Express server on port `3000` with the live Vite asset pipeline enabled.

2. **Core Workflows**:
   - **Load Sandbox Scenarios**: Click on any of the preconfigured industrial incidents (Bottling Line Jam, Thermal Sealer Runaway, Conveyor Motor Overload) to load detailed cross-system test datasets.
   - **Upload Custom Logs**: Drag-and-drop CSV or JSON logs into the tabular data hub. The engine automatically maps and normalizes column headers.
   - **Identify Precursors**: View the statistics tab to identify indicators occurring `< 2m`, `< 5m`, or `< 10m` before equipment stoppage.
   - **Generate Root-Cause Reports**: Direct server-side call prompts the Gemini model to synthesize all telemetry data, providing a complete "5 Whys" narrative.

---

## Testing

1. **Type and Lint Verification**:
   Verify types and lint configurations using TypeScript:
   ```bash
   npm run lint
   ```

---

## Build / Deploy

1. **Production Compilation**:
   Compile frontend assets and bundle the server into a single production CommonJS target:
   ```bash
   npm run build
   ```

2. **Run Production Container**:
   Boot the compiled container web service:
   ```bash
   npm run start
   ```
   The backend server automatically binds to port `3000` on host `0.0.0.0`, serving static files from `dist/` and proxying API endpoints.
