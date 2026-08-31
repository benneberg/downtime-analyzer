# Factory Insight AI (Downtime Analyzer)

> Full-stack industrial analytics and automation suite for cross-correlating PLC alarms, operator shift logs, and maintenance records to diagnose root causes of manufacturing downtime.

[![CI Status](https://github.com/benneberg/downtime-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/benneberg/downtime-analyzer/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime](https://img.shields.io/badge/Runtime-Node.js%2022%20%7C%20Express%20%2B%20Vite-blue)](package.json)
[![Compliance](https://img.shields.io/badge/Standards-IEC%2061131--3%20%7C%20ISA--18.2-amber)](src/components/PlcCodeReview.tsx)

---

## Overview

In modern manufacturing, unexpected machinery stoppages require engineers to manually parse through thousands of unaligned logs across disconnected silos: SCADA databases, operator handovers, and paper or CMMS work orders. Finding the true connection between a physical sensor spike and an operator action is slow, manual, and error-prone.

**Factory Insight AI** eliminates downtime correlation lag. It merges PLC telemetry, shift notes, maintenance logs, and stop events into a millisecond-accurate, unified chronological timeline. Powered by Google Gemini 3.5 Flash (with built-in offline heuristic fallback engines), the platform generates 5-Whys diagnostic reports, identifies precursor alarm signatures, audits IEC 61131-3 PLC code, and monitors live SCADA streams (OPC UA / MQTT Sparkplug B).

---

## Target Audience

- **Reliability Engineers**: Identify pre-downtime micro-alarm signatures, calculate MTTR, and track recurring failure modes.
- **Maintenance Managers**: Receive structured Corrective and Preventive Action (CAPA) items with clear component ownership.
- **Controls & Automation Engineers**: Audit IEC 61131-3 Structured Text for Hungarian notation compliance and fail-safe safety interlocks.
- **Plant Operators & Shift Supervisors**: Review human-readable shift handover summaries and transition fatigue metrics without manually reading ladder logic.

---

## Core Capabilities

### 1. Downtime Root Cause Analyzer
- **Interactive Industrial Scenarios**: Preloaded manufacturing incident simulations including Bottling Line Feed Jam, Packaging Sealer Overheat, and CNC Cell Conveyor Motor Overload.
- **AI 5-Whys Synthesis Engine**: Generates an executive summary, a structured 5-Whys causal chain, likely causes with confidence scoring, and categorized CAPA recommendations via Gemini 3.5 Flash or offline heuristic analysis.
- **Precursor Alarm Signature Scanner**: Isolates micro-alarms and sensor chatter occurring `< 2 minutes`, `< 5 minutes`, and `< 10 minutes` prior to production stoppages.
- **Sequence-of-Events Aligned Timeline**: Chronologically unified stream of hardware alarms, operator notes, maintenance events, and stoppages with relative time offsets and an interactive replay scrubber.
- **ISA-18.2 Anomaly Analytics**: Statistical Z-score calculations over alarm frequency buckets with downsampled Recharts visualizations.

### 2. IEC 61131-3 PLC Code Reviewer
- **Multi-Format Ingestion**: Upload or paste Structured Text (`.st`, `.xml`) with controller presets for Siemens S7-1500, Beckhoff TwinCAT 3, and Rockwell Studio 5000.
- **Hungarian Notation & Standards Linting**: Verifies scope and type prefixes (`b`, `n`, `f`, `s`, `t`, `fb`, `g_`, `c_`).
- **Dead Code & Logic Detection**: Flags unreachable branches and permanent manual bypass overrides.
- **Safety Interlock Auditing**: Validates dual-channel E-stop latching and safety relay permissives.
- **1-Click Remediation**: Generates side-by-side code diffs and downloadable refactored Structured Text.

### 3. SCADA & Connected Factory Bridge
- **OPC UA Server Simulation**: Browse address spaces (`opc.tcp://192.168.1.120:4840`), inspect node data types/qualities, and execute single or continuous polling loops.
- **MQTT Sparkplug B Decoder**: Subscribe to metric streams (`spBv1.0/...`), decoding vibration, current draw, and digital sensor flags in real time.
- **Role-Based Access Control (RBAC)**: Interactive role switcher (Admin, Analyst, Viewer) with granular action permissions.

### 4. Data Ingestion & Transformation Hub
- **Multi-Source Diagnostics Table**: Tabbed views for PLC Alarms, Operator Shift Notes, Maintenance Records, and Production Stops with manual record entry.
- **Web Worker CSV Parser**: Offloads file parsing to a background browser worker to maintain 60fps UI responsiveness.
- **Configurable Ingestion Rules**: Custom column mapping, timezone adjustments, and regex search/replace substitutions.
- **Export Capabilities**: Export unified datasets to JSON or formatted, printable PDF inspection reports.

---

## Architecture & Documentation

- [System Architecture](ARCHITECTURE.md) — Component boundaries, data flow, API routes, state management, and invariants.
- [Contributing Guidelines](CONTRIBUTING.md) — Local development workflow, code conventions, and verification steps.
- [Security Policy](SECURITY.md) — API key isolation, client-side data boundaries, and vulnerability reporting.

---

## Requirements

- **Node.js**: `>= 18.0.0` (Recommended: Node 22)
- **Package Manager**: `npm` or `bun`
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge

---

## Installation

```bash
git clone https://github.com/benneberg/downtime-analyzer.git
cd downtime-analyzer
npm install
```

---

## Configuration

Environment variables can be defined in `.env` (refer to `.env.example`):

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | String | *(Optional)* | Google Gemini API key for real-time 5-Whys generation and PLC code safety audits. When unset, the platform falls back to offline heuristic engines. |
| `PORT` | Number | `3000` | HTTP server port for both API endpoints and the single-page application. |
| `NODE_ENV` | String | `development` | Setting to `production` serves optimized static bundles from `dist/`. |

---

## Usage

### Development Mode
Starts the Express server with embedded Vite middleware for instant live-reload:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Verification & Linting
Run static TypeScript type assertions:
```bash
npm run lint
```

### Production Build
Bundle both client-side assets and the standalone backend server:
```bash
npm run build
```
This compiles frontend assets into `dist/` and packages the Express server into `dist/server.cjs`.

### Production Launch
```bash
npm start
```
Executes `node dist/server.cjs` on port 3000 with zero external development dependencies.

---

## User-Facing API Overview

The Express backend exposes REST endpoints under `/api/*`:

- `GET /api/key-status` — Returns whether a valid `GEMINI_API_KEY` is loaded (`{ configured: boolean }`).
- `POST /api/analyze` — Synthesizes PLC alarms, operator logs, maintenance events, and stop records into a structured JSON 5-Whys root cause report.
- `GET /api/opcua/nodes` — Returns simulated OPC UA server metadata and address-space node hierarchy.
- `POST /api/opcua/poll` — Polls specified node IDs, returning current values and generated live alarm events.
- `POST /api/plc-review` — Performs static and AI safety audits on uploaded Structured Text code.

---

## Repository Structure

```
├── .env.example               # Environment variable declaration template
├── index.html                 # Frontend HTML entry point
├── metadata.json              # Platform application metadata
├── package.json               # Dependencies and build scripts
├── server.ts                  # Express backend & Vite middleware entry point
├── tsconfig.json              # TypeScript compiler configuration
├── vite.config.ts             # Vite build configuration
├── ARCHITECTURE.md            # Canonical system architecture documentation
├── CONTRIBUTING.md            # Development instructions and code conventions
├── SECURITY.md                # Security policy and isolation boundaries
├── .llm-context/              # AI coding agent context and conventions
│   └── context.md             # Canonical AI guidelines and invariants
└── src/
    ├── main.tsx               # Client React entry point
    ├── App.tsx                # Main workspace application shell and navigation
    ├── index.css              # Global Tailwind CSS styles
    ├── data/
    │   └── scenarios.ts       # Preloaded manufacturing datasets & scenarios
    └── components/
        ├── ConnectedFactory.tsx    # OPC UA & MQTT Sparkplug B interface
        ├── DashboardCharts.tsx     # Recharts time-series & ISA-18.2 anomaly badges
        ├── DataTables.tsx          # Multi-tab data tables & CSV ingestion rules
        ├── PlcCodeReview.tsx       # Structured Text IEC 61131-3 code reviewer
        ├── PrecursorDetection.tsx  # Pre-downtime micro-alarm scanner
        ├── PricingPlans.tsx        # Tier comparison & technical capabilities
        ├── RootCauseReport.tsx     # 5-Whys AI analysis report view
        ├── ScenarioSelector.tsx    # Scenario selection toolbar
        └── TimelineAlignment.tsx   # Chronological sequence-of-events view
```

---

## License

This project is licensed under the [MIT License](LICENSE).
