# Industrial SaaS Roadmap

## Project 1 – PLC Code Review

### Goal
Automatically review PLC code for quality, standards, and safety before commissioning.

### MVP
- Upload Structured Text / PLCopen XML
- Parse variables, programs, FBs
- IEC naming/style checks
- Dead code detection
- AI logic & safety review
- HTML/PDF/JSON reports

### Phase 2
- GitHub/GitLab/Azure DevOps integration
- CLI & pre-commit hook
- VS Code extension
- Team dashboards

### Long Term
- Vendor-specific support (TIA Portal, TwinCAT, Rockwell)
- Organization rule packs
- Auto-fix suggestions

---

## Project 2 – Downtime Analyzer

### Goal
Explain why production stopped by correlating alarms, operator notes, and maintenance events.

### MVP
- CSV/Excel upload
- Timeline normalization
- Alarm/operator correlation
- Precursor alarm detection
- AI root-cause summary
- PDF export

### Phase 2
- Precursor alarm visualizations
- Timeline replay
- Shift-change analysis
- Data validation & cleaning
- Maintenance correlation

### Phase 3
- OPC UA connector
- MQTT connector
- Scheduled imports
- Live dashboards
- Authentication (Admin / Analyst / Viewer)

### Phase 4
- Similar Events search
- Pattern detection
- Corrective action suggestions
- Repeat-event clustering

### Phase 5
- Predictive downtime
- Failure probability
- Remaining useful life (RUL)
- Proactive alerts

---

# Additional Micro-SaaS Ideas

## PLC Documentation Generator
Generate documentation, I/O lists, tag descriptions, and change logs from PLC projects.

## Alarm Rationalization Assistant
Detect nuisance alarms, duplicate alarms, and recommend alarm improvements.

## PLC Backup Manager
Automatic PLC project backups with version history and change tracking.

## FAT/SAT Test Manager
Create, execute, and archive Factory/Site Acceptance Test procedures.

## Commissioning Tracker
Track punch lists, startup issues, and commissioning progress.

## PLC Change Impact Analyzer
Compare PLC versions and explain functional differences.

## Industrial Log Explorer
Search large PLC/SCADA logs with AI-assisted filtering.

## OEE Insight
Simple OEE dashboard with bottleneck and loss analysis.

## Maintenance Knowledge Base
Search previous failures, fixes, manuals, and SOPs using AI.

## OPC UA Explorer (Buy Once)
Desktop tool to browse servers, tags, permissions, and data quality.

## MQTT Industrial Explorer (Buy Once)
Desktop client for Sparkplug B/MQTT diagnostics and message visualization.

## PLCopen XML Viewer (Buy Once)
Open, compare, and visualize PLCopen XML without vendor software.

## Tag Naming Validator (Buy Once)
Validate PLC tag naming standards across projects.

## Industrial CSV Toolkit (Buy Once)
Clean, normalize, merge, and validate industrial log files.

## Alarm Sequence Visualizer (Buy Once)
Convert alarm logs into interactive event timelines.

## Recipe & Parameter Compare Tool (Buy Once)
Compare machine recipes and parameter sets across versions.

## Trend Analyzer
Automatically detect anomalies and recurring patterns in historian exports.

---

# Suggested Build Order

1. PLC Code Review
2. Downtime Analyzer
3. PLC Documentation Generator
4. Alarm Rationalization Assistant
5. OPC UA Explorer
6. MQTT Explorer
7. Industrial Log Explorer
8. OEE Insight

Focus on solving one expensive industrial problem at a time and keep each product independently deployable.
