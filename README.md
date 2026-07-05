# Downtime Analyzer (Factory Insight AI)

## Overview
The **Downtime Analyzer** (Factory Insight AI) is an advanced full-stack manufacturing analytics platform that combines real-time PLC alarms, operator logs, maintenance records, and production events to identify the true root causes of equipment downtime. It solves expensive manufacturing bottlenecks by correlating disparate data streams and generating structured "5 Whys" reports via `gemini-3.5-flash`.

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
