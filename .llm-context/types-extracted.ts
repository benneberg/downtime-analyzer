// Auto-extracted TypeScript type definitions
// Generated: 2026-08-27 14:20 UTC
// Types annotated with 'used in:' show cross-file import relationships.


// -- src/data/scenarios.ts --
export interface PLCAlarm {
  id: string;
  timestamp: string; // ISO format or normal
  tag: string;
  message: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
}
// used in: src/App.tsx, src/components/ConnectedFactory.tsx, src/components/DashboardCharts.tsx, src/components/DataTables.tsx, src/components/PrecursorDetection.tsx (+2 more)

export interface OperatorLog {
  id: string;
  timestamp: string;
  operatorName: string;
  observation: string;
  machineryState: string;
}
// used in: src/App.tsx, src/components/DataTables.tsx, src/components/RootCauseReport.tsx, src/components/TimelineAlignment.tsx

export interface MaintenanceEvent {
  id: string;
  timestamp: string;
  technician: string;
  actionTaken: string;
  partsReplaced?: string;
  status: "Completed" | "In-Progress" | "Pending";
}
// used in: src/App.tsx, src/components/DataTables.tsx, src/components/RootCauseReport.tsx, src/components/TimelineAlignment.tsx

export interface ProductionStop {
  id: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  equipment: string;
  status: "STOPPED" | "DEGRADED";
}
// used in: src/App.tsx, src/components/DashboardCharts.tsx, src/components/DataTables.tsx, src/components/PrecursorDetection.tsx, src/components/RootCauseReport.tsx (+1 more)

export interface Scenario {
  id: string;
  name: string;
  description: string;
  equipment: string;
  plcAlarms: PLCAlarm[];
  operatorLogs: OperatorLog[];
  maintenanceEvents: MaintenanceEvent[];
  productionStops: ProductionStop[];
  expectedRootCause: string;
}
// used in: src/App.tsx, src/components/ScenarioSelector.tsx
