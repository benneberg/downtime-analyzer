# Downtime Analyzer (Factory Insight AI)

An AI-powered manufacturing analytics platform that combines PLC alarms, operator logs, maintenance records, and production events to identify the true root causes of equipment downtime.

## 🚀 Features implemented in this React application

1. **Multi-Source Data Ingestion**:
   - Simulated upload and real-time validation of PLC Alarms (CSV), Operator Logs (JSON/Excel style), and Maintenance Event data.
   - Includes sample industrial datasets (e.g., Bottling Line Jam, Packaging Heat Sealer Overheat, Conveyor Motor Overload) ready to load instantly.

2. **Data Normalization Engine**:
   - Converts disparate timestamps from operator records, PLC raw logs, and maintenance logs into consistent **UTC ISO-8601** timestamps.

3. **Time-Series Timeline Alignment**:
   - Correlates operator notes, nearest alarms (precursors), maintenance response, and the overall machinery production state.
   - Highlights exact sequence of events before, during, and after downtime.

4. **Precursor Detection**:
   - Statistically scans timestamps to identify alarms and faults that occurred consistently **2 minutes**, **5 minutes**, or **10 minutes** before the actual machine stoppage.

5. **AI Root Cause Report (Gemini API Integration)**:
   - Uses `gemini-3.5-flash` server-side to generate:
     - **Executive Summary**
     - **5 Whys Analysis** (Industrial standard problem-solving framework)
     - **Likely Root Causes**
     - **Recommended Preventive Actions (CAPA)**

6. **Interactive Timeline Dashboard**:
   - Visualizes stops, alarms, and operator annotations with color-coded severity.
   - Features rich charts utilizing `recharts` for fault frequencies, downtime duration analysis, and heatmaps.
   - Interactive timeline zoom and detail popovers.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts (Industrial dashboards), Motion (for fluid micro-interactions).
- **Backend**: Express (Custom server for secure Gemini API key handling, server-side data correlation, and analysis).
- **AI Integration**: Google `@google/genai` SDK using `gemini-3.5-flash`.

---

## 💻 Getting Started

### 1. Configure the API Key
Set up your Gemini API key in the **Settings > Secrets** panel in AI Studio:
```env
GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

### 2. Development Setup
Run the development server:
```bash
npm run dev
```

The application runs a full-stack Express + Vite environment. All API calls are securely proxy-routed through the Express backend on port `3000`.

### 3. Production Build
Build the optimized frontend assets and bundle the server using `esbuild`:
```bash
npm run build
```

Start the production server:
```bash
npm run start
```
