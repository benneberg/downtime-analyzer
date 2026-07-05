# Product Purpose and Strategy

## Product Summary
The **Downtime Analyzer** (Factory Insight AI) is a full-stack, AI-powered industrial analysis solution designed to cross-correlate fragmented data streams—such as PLC hardware alarms, manual shift diaries, and technician work order notes—and synthesize them into diagnostic reports. By utilizing Gemini 3.5 Flash, it produces logical root-cause summaries and "5 Whys" analyses, helping factory management prevent recurring production interruptions.

## Problem Statement
In modern manufacturing, when a machine line unexpectedly stops, engineers are forced to dig through thousands of unaligned logs in separate siloed systems: SCADA databases, operator handovers, and paper maintenance work orders.
- **Siloed Information**: PLC logs exist in milliseconds, shift handovers exist as loose text, and work orders are logged in maintenance software.
- **Correlation Lag**: Finding the true connection between an operator's manual action and a thermal sensor spike 20 minutes later is manual, error-prone, and slow.
- **Lost Knowledge**: Stoppage learnings are rarely structured, leading to duplicate failure modes and high recurring costs.

## Target Audience
- **Reliability Engineers**: (Confidence: **High**) Seeking statistical precursor indicators of system failures.
- **Maintenance Managers**: (Confidence: **High**) Requiring actionable preventive maintenance (CAPA) items to stop recurring failures.
- **Production Supervisors**: (Confidence: **Medium**) Needing readable summaries of shift performance and operational bottlenecks without deep-diving into PLC ladder logic registers.

## Value Proposition
- **Turn Raw Logs Into Root Causes**: Translates complex hex values and sensor codes into actionable engineering items in seconds.
- **No-Blame Troubleshooting**: Focuses on finding underlying system faults (e.g. worn out gearbox seals) instead of scapegoating operators.
- **Sideload Manual Logs with Physical Records**: Empowers operators to merge local spreadsheets and CSV telemetry directly into an unified, visual downtime sequence.

## Product Features

### 1. Verified Core Features (Implemented in Repo)
- **Multi-System Ingestion Data Hub**: Real-time tabular data management of PLC Alarms, Operator Shift Notes, Maintenance Actions, and Production Stop records.
- **Statistical Precursor Signature Detector**: Instantly scans and isolates PLC registers that triggered precisely `< 2 minutes`, `< 5 minutes`, and `< 10 minutes` prior to production stops.
- **Sequence-of-Events Correlation Timeline**: A chronologically-sorted, unified stream displaying physical hardware indicators aligned alongside human-logged events, complete with positive/negative uptime offset.
- **AI 5-Whys Synthesis Engine**: Directly triggers a server-side Gemini 3.5 Flash model to output an executive summary, structured 5 Whys chain, and recommended preventive actions in validated JSON.
- **Scenario Selector**: Interactive sandboxed factory simulations (Bottling Line Feed Jam, Packaging Sealer Overheat, Conveyor Motor Overload).

### 2. Inferred Features (Underlying Logical Assumptions)
- **Log Header Normalization**: Automatically tries to identify column headers (`time`, `severity`, `tag`) when custom industrial logs are dropped.

### 3. Future Roadmap Features (Planned)
- **OPC UA Live Integration**: Connect directly to physical PLC endpoints to read real-time tag parameters.
- **MQTT Broker Broker Bridge**: Push telemetry asynchronously from low-bandwidth remote industrial IoT nodes.
- **Inductive Ignition Connector**: A structural plugin allowing seamless integration into existing Ignition-based SCADA configurations.
