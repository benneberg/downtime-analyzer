export interface PLCAlarm {
  id: string;
  timestamp: string; // ISO format or normal
  tag: string;
  message: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
}

export interface OperatorLog {
  id: string;
  timestamp: string;
  operatorName: string;
  observation: string;
  machineryState: string;
}

export interface MaintenanceEvent {
  id: string;
  timestamp: string;
  technician: string;
  actionTaken: string;
  partsReplaced?: string;
  status: "Completed" | "In-Progress" | "Pending";
}

export interface ProductionStop {
  id: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  equipment: string;
  status: "STOPPED" | "DEGRADED";
}

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

export const INDUSTRIAL_SCENARIOS: Scenario[] = [
  {
    id: "bottling-jam",
    name: "Bottling Line - Feed Jam & Backup",
    description: "The main bottling packaging cell shut down unexpectedly during the night shift. Standard alarms triggered, but multiple operator bypasses occurred beforehand.",
    equipment: "Bottling Infeed Cell B2",
    plcAlarms: [
      { id: "a1", timestamp: "2026-07-04T02:05:00Z", tag: "PE_402_BACKUP", message: "Downstream Backup Photo-Eye Blocked", severity: "INFO" },
      { id: "a2", timestamp: "2026-07-04T02:08:12Z", tag: "PE_402_BACKUP", message: "Downstream Backup Photo-Eye Blocked - Continuous High", severity: "WARNING" },
      { id: "a3", timestamp: "2026-07-04T02:10:00Z", tag: "DRV_CONV_MTR", message: "Infeed Conveyor Variable Frequency Drive Fault", severity: "WARNING" },
      { id: "a4", timestamp: "2026-07-04T02:11:45Z", tag: "PE_402_BACKUP", message: "Backup Sensor Bypass Activated (Manual Override)", severity: "WARNING" },
      { id: "a5", timestamp: "2026-07-04T02:14:20Z", tag: "MTR_CURR_HIGH", message: "Infeed Drive Motor Amperage > 15A limit", severity: "WARNING" },
      { id: "a6", timestamp: "2026-07-04T02:15:00Z", tag: "SAFETY_CURTAIN_B", message: "Safety Light Curtain B Violated - Emergency Stop Triggered", severity: "CRITICAL" },
      { id: "a7", timestamp: "2026-07-04T02:15:05Z", tag: "SYS_ESTOP", message: "Main Line Emergency Stop State Active", severity: "CRITICAL" }
    ],
    operatorLogs: [
      { id: "o1", timestamp: "2026-07-04T01:50:00Z", operatorName: "Marco S.", observation: "Slight guide rail vibration observed. Tightened structural bracket.", machineryState: "RUNNING" },
      { id: "o2", timestamp: "2026-07-04T02:07:00Z", operatorName: "Marco S.", observation: "Minor bottle backing up on the accumulator table. Gently cleared manually without stopping the line.", machineryState: "RUNNING" },
      { id: "o3", timestamp: "2026-07-04T02:11:00Z", operatorName: "Marco S.", observation: "Downstream conveyor photo-eye was triggering false jam alarms due to syrup spill from sticky bottles. Temproarily toggled software bypass to keep line moving.", machineryState: "RUNNING" },
      { id: "o4", timestamp: "2026-07-04T02:16:00Z", operatorName: "Marco S.", observation: "Main conveyor came to a sudden, loud stop. Glass bottles shattered near the safety curtain area. Tripped manual emergency stop.", machineryState: "STOPPED" }
    ],
    maintenanceEvents: [
      { id: "m1", timestamp: "2026-07-04T02:22:00Z", technician: "Elena R. (Automation)", actionTaken: "Responded to Emergency Stop. Found pile-up of 45 sugar bottles jammed against the main guide rails, forcing the conveyor motor to draw excessive current until safety curtain was tripped by a falling box.", status: "Completed", partsReplaced: "None - Mechanical Cleared" },
      { id: "m2", timestamp: "2026-07-04T02:35:00Z", technician: "Elena R. (Automation)", actionTaken: "Cleaned sugar and syrup residue off the PE_402 photo-eye sensor lenses. Calibrated alignment and disabled the manual software bypass.", status: "Completed", partsReplaced: "Reflector Tape" }
    ],
    productionStops: [
      { id: "s1", startTime: "2026-07-04T02:15:00Z", endTime: "2026-07-04T02:40:00Z", durationMinutes: 25, equipment: "Bottling Infeed Cell B2", status: "STOPPED" }
    ],
    expectedRootCause: "Sticky syrup residue covered the accumulation sensor (PE_402), which led the operator to activate a manual software bypass rather than clean the sensor. Without the backup sensor's automatic line pacing, bottles piled up continuously, jammed, and eventually knocked over boxes, violating the safety light curtain and causing a hard emergency stop."
  },
  {
    id: "sealer-overheat",
    name: "Packaging Line - Thermal Sealer Runaway",
    description: "Heat sealer on a plastic flow-wrapper line kept showing high temperature fluctuations until it shut down, melting several rolls of polyethylene film.",
    equipment: "Flow Wrapper Sealer Unit FW-1",
    plcAlarms: [
      { id: "b1", timestamp: "2026-07-04T03:30:00Z", tag: "TEMP_ZONE_1_ACT", message: "Heater Zone 1 Temperature high deviation (+12C)", severity: "INFO" },
      { id: "b2", timestamp: "2026-07-04T03:35:10Z", tag: "PID_OUT_CLAMP", message: "PID Controller Output Saturated at 100% duty cycle", severity: "WARNING" },
      { id: "b3", timestamp: "2026-07-04T03:40:00Z", tag: "TEMP_ZONE_1_CRIT", message: "Heater Zone 1 Temperature Over Limit (215C / Max 200C)", severity: "CRITICAL" },
      { id: "b4", timestamp: "2026-07-04T03:41:15Z", tag: "TC_OPEN_WIRE", message: "Thermocouple Type K Open Circuit Fault Detected", severity: "CRITICAL" },
      { id: "b5", timestamp: "2026-07-04T03:41:20Z", tag: "SEAL_DRV_TRIP", message: "Sealing Jaw Drive Overload - Mechanical Torque Limit Exceeded", severity: "CRITICAL" }
    ],
    operatorLogs: [
      { id: "op_s1", timestamp: "2026-07-04T03:25:00Z", operatorName: "Thomas K.", observation: "Sealing jaw odor detected, but seam inspection on bags showed strong seals. Continued speed run.", machineryState: "RUNNING" },
      { id: "op_s2", timestamp: "2026-07-04T03:38:00Z", operatorName: "Thomas K.", observation: "Bags started sticking to the sealing jaw. Adjusted line speed to 110% to push them through faster.", machineryState: "RUNNING" },
      { id: "op_s3", timestamp: "2026-07-04T03:42:00Z", operatorName: "Thomas K.", observation: "Thick plastic smoke from the sealer hood. Wrapper jammed completely with melted film around the jaws. Pressed E-stop.", machineryState: "STOPPED" }
    ],
    maintenanceEvents: [
      { id: "m_s1", timestamp: "2026-07-04T03:48:00Z", technician: "Devon M. (Electrical)", actionTaken: "Responded to thermal runaway alarm. Found Heater SSR (Solid State Relay) welded in the closed/on position. This caused 100% current to feed to the heating cartridges continuously, bypassing PID logic.", status: "Completed", partsReplaced: "Solid State Relay, Thermocouple Type-K" },
      { id: "m_s2", timestamp: "2026-07-04T04:10:00Z", technician: "Devon M. (Electrical)", actionTaken: "Scraped baked, melted polyethylene plastic off sealing copper jaws. Polished surfaces and re-threaded thermocouple wire.", status: "Completed", partsReplaced: "Thermocouple Sensor, Polyimide Insulator" }
    ],
    productionStops: [
      { id: "stop_s1", startTime: "2026-07-04T03:41:20Z", endTime: "2026-07-04T04:25:00Z", durationMinutes: 43, equipment: "Flow Wrapper Sealer Unit FW-1", status: "STOPPED" }
    ],
    expectedRootCause: "The solid-state relay (SSR) failed short/closed, resulting in constant electrical heating of the sealer jaws. The PID controller had no control over the heating element. The rising heat eventually caused the thermocouple wire to degrade/open, and melted the plastic packaging film into a sticky mass that mechanically locked the jaw drive, tripping the overload."
  },
  {
    id: "conveyor-overload",
    name: "Sortation - Main Sorter Conveyor Motor Overload",
    description: "Multi-belt sortation conveyor stopped during peak shift. High vibration warnings were neglected due to sensor clutter.",
    equipment: "Sorting Conveyor Belt SC-3",
    plcAlarms: [
      { id: "c1", timestamp: "2026-07-04T00:15:00Z", tag: "ACCEL_VIB_Z", message: "Conveyor Drive Bearing Vibration Zone High (Z-Axis)", severity: "INFO" },
      { id: "c2", timestamp: "2026-07-04T00:45:00Z", tag: "ACCEL_VIB_Z", message: "Bearing Vibration Exceeds Baseline (6.2 mm/s)", severity: "WARNING" },
      { id: "c3", timestamp: "2026-07-04T01:10:00Z", tag: "MOTOR_TEMP_HIGH", message: "Motor Coil Temperature High (105C / Alarm 110C)", severity: "WARNING" },
      { id: "c4", timestamp: "2026-07-04T01:25:00Z", tag: "VFD_AMPS_WARN", message: "VFD Motor Draw Exceeds 120% Rated load (Continuous)", severity: "WARNING" },
      { id: "c5", timestamp: "2026-07-04T01:30:15Z", tag: "VFD_TRIP_OL", message: "VFD Overload Internal Trip (OL2 fault code)", severity: "CRITICAL" }
    ],
    operatorLogs: [
      { id: "op_c1", timestamp: "2026-07-04T00:30:00Z", operatorName: "Sarah G.", observation: "Unusual squealing sound from drive motor area. Notified team chat, but line velocity is meeting target. No stoppage planned.", machineryState: "RUNNING" },
      { id: "op_c2", timestamp: "2026-07-04T01:31:00Z", operatorName: "Sarah G.", observation: "Conveyor slowed down to a dead stop. VFD screen displays OL2. Sorter is backed up to packing.", machineryState: "STOPPED" }
    ],
    maintenanceEvents: [
      { id: "m_c1", timestamp: "2026-07-04T01:38:00Z", technician: "John D. (Mechanical)", actionTaken: "Checked motor and gear reducer. Motor shaft is hot to the touch. Gearbox oil level is low/empty, leading to severe friction inside the planetary gears, which caused high vibration and motor overload.", status: "Completed", partsReplaced: "Reducer Bearing Oil (ISO VG 220)" },
      { id: "m_c2", timestamp: "2026-07-04T02:00:00Z", technician: "John D. (Mechanical)", actionTaken: "Filled gearbox with oil, performed manual rotation check. Squealing stopped. Reset VFD.", status: "Completed", partsReplaced: "Gearbox Seals" }
    ],
    productionStops: [
      { id: "stop_c1", startTime: "2026-07-04T01:30:15Z", endTime: "2026-07-04T02:05:00Z", durationMinutes: 35, equipment: "Sorting Conveyor Belt SC-3", status: "STOPPED" }
    ],
    expectedRootCause: "The sorting conveyor gearbox suffered a slow, unmonitored oil leak. Over weeks, the gear teeth ran dry, driving friction and mechanical torque demand through the roof. This triggered the bearing vibration alarm first, and eventually caused the motor to draw heavy current until the VFD's thermal overload protective model (OL2) tripped to prevent motor wind-up burnout."
  }
];
