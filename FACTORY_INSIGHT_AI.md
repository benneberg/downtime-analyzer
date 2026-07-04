# Factory Insight AI
## Industrial Downtime Root Cause Analyzer

### Elevator Pitch
An AI-powered manufacturing analytics platform that combines PLC alarms, operator logs, maintenance records, and production events to identify the true root causes of equipment downtime.

---

### Target Customers
* Manufacturing Plants
* Production Managers
* Maintenance Managers
* Continuous Improvement Teams
* Reliability Engineers

---

### Core Problem
Factories collect data from:
* PLCs
* SCADA
* MES
* CMMS
* Operators

But almost nobody correlates these sources automatically.
Most teams only know **“The machine stopped.”**
They don’t know **“Why did it stop?”**

---

### MVP Features

#### Feature 1: Upload
* PLC Alarm CSV
* Operator Logs
* Excel
* Maintenance Events

#### Feature 2: Normalize Data
* Convert everything to UTC and ISO-8601

#### Feature 3: Timeline Alignment
Automatically correlate:
* Operator note
  ↓
* Nearest alarms
  ↓
* Maintenance
  ↓
* Production state

#### Feature 4: Precursor Detection
Find alarms that consistently happen:
* 2 minutes
* 5 minutes
* 10 minutes
before downtime.

#### Feature 5: AI Root Cause Report
Generate:
* Executive Summary
* 5 Whys
* Likely causes
* Recommended actions

#### Feature 6: Timeline Dashboard
Visualize:
* Alarms
* Stops
* Operator actions
* Maintenance
* Shift changes

---

### Future Features
* OPC UA live connector
* MQTT ingestion
* Ignition integration
* Siemens WinCC
* Rockwell FactoryTalk
* Power BI connector
* Predictive downtime
* Auto-generated CAPA reports

---

### Architecture
PLC Logs  
  ↓  
Normalization  
  ↓  
Time Alignment  
  ↓  
Correlation Engine  
  ↓  
Statistical Analysis  
  ↓  
AI Report  
  ↓  
Dashboard  

---

### Tech Stack
* **Backend:** FastAPI
* **Data:** Polars
* **Database:** PostgreSQL
* **Time Series:** TimescaleDB
* **Frontend:** Next.js
* **Charts:** Recharts
* **AI:** OpenAI
* **Local LLM:** Ollama
* **Deployment:** Azure, Docker

---

### Development Roadmap

#### Phase 1: Import engine
* CSV, Excel, JSON

#### Phase 2: Timeline alignment
* Time normalization
* Matching algorithm

#### Phase 3: Correlation engine
* Precursor detection
* Trend analysis

#### Phase 4: AI reporting
* 5 Whys
* Narrative generation
* Recommendations

#### Phase 5: Dashboard
* Timeline
* Statistics
* Heatmaps

---

### Competitive Advantages
* AI explains the data
* Cross-system correlation
* Shift-aware analysis
* Focus on process improvement rather than blame
* Industrial-specific workflows

---

### Pricing
* **Starter:** €149/month
* **Professional:** €499/month
* **Enterprise:** Custom

---

### Success Metrics
* Downtime analyzed
* Root causes identified
* Repeat precursor patterns
* Time saved in investigations
* Reduction in MTTR
