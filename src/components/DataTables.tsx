import React, { useState, useRef } from "react";
import { PLCAlarm, OperatorLog, MaintenanceEvent, ProductionStop } from "../data/scenarios";
import { Plus, Trash2, Calendar, User, Wrench, ShieldAlert, FileSpreadsheet, Upload, ClipboardCheck } from "lucide-react";

interface DataTablesProps {
  plcAlarms: PLCAlarm[];
  setPlcAlarms: React.Dispatch<React.SetStateAction<PLCAlarm[]>>;
  operatorLogs: OperatorLog[];
  setOperatorLogs: React.Dispatch<React.SetStateAction<OperatorLog[]>>;
  maintenanceEvents: MaintenanceEvent[];
  setMaintenanceEvents: React.Dispatch<React.SetStateAction<MaintenanceEvent[]>>;
  productionStops: ProductionStop[];
  setProductionStops: React.Dispatch<React.SetStateAction<ProductionStop[]>>;
}

type TabType = "plc" | "operator" | "maintenance" | "stops";

export default function DataTables({
  plcAlarms,
  setPlcAlarms,
  operatorLogs,
  setOperatorLogs,
  maintenanceEvents,
  setMaintenanceEvents,
  productionStops,
  setProductionStops,
}: DataTablesProps) {
  const [activeTab, setActiveTab] = useState<TabType>("plc");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Advanced CSV Cleaning Utility States
  const [showCleaningRules, setShowCleaningRules] = useState(false);
  const [customTagCol, setCustomTagCol] = useState("");
  const [customMsgCol, setCustomMsgCol] = useState("");
  const [customTimeCol, setCustomTimeCol] = useState("");
  const [timezoneOffset, setTimezoneOffset] = useState<number>(0);
  const [substitutionFrom, setSubstitutionFrom] = useState("");
  const [substitutionTo, setSubstitutionTo] = useState("");

  // Form states for adding rows
  const [plcForm, setPlcForm] = useState({ tag: "", message: "", severity: "WARNING" as const, timestamp: "" });
  const [opForm, setOpForm] = useState({ operatorName: "", observation: "", machineryState: "RUNNING", timestamp: "" });
  const [maintForm, setMaintForm] = useState({ technician: "", actionTaken: "", partsReplaced: "", status: "Completed" as const, timestamp: "" });
  const [stopForm, setStopForm] = useState({ startTime: "", endTime: "", equipment: "", status: "STOPPED" as const });

  // Get current UTC ISO timestamp string
  const getNowISO = () => new Date().toISOString();

  // Handle adding rows
  const addPlcAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plcForm.tag || !plcForm.message) return;
    const newAlarm: PLCAlarm = {
      id: "plc_" + Date.now(),
      tag: plcForm.tag.trim().toUpperCase(),
      message: plcForm.message.trim(),
      severity: plcForm.severity,
      timestamp: plcForm.timestamp ? new Date(plcForm.timestamp).toISOString() : getNowISO(),
    };
    setPlcAlarms((prev) => [newAlarm, ...prev]);
    setPlcForm({ tag: "", message: "", severity: "WARNING", timestamp: "" });
  };

  const addOperatorLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opForm.operatorName || !opForm.observation) return;
    const newLog: OperatorLog = {
      id: "op_" + Date.now(),
      operatorName: opForm.operatorName.trim(),
      observation: opForm.observation.trim(),
      machineryState: opForm.machineryState,
      timestamp: opForm.timestamp ? new Date(opForm.timestamp).toISOString() : getNowISO(),
    };
    setOperatorLogs((prev) => [newLog, ...prev]);
    setOpForm({ operatorName: "", observation: "", machineryState: "RUNNING", timestamp: "" });
  };

  const addMaintenanceEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintForm.technician || !maintForm.actionTaken) return;
    const newMaint: MaintenanceEvent = {
      id: "maint_" + Date.now(),
      technician: maintForm.technician.trim(),
      actionTaken: maintForm.actionTaken.trim(),
      partsReplaced: maintForm.partsReplaced.trim() || undefined,
      status: maintForm.status,
      timestamp: maintForm.timestamp ? new Date(maintForm.timestamp).toISOString() : getNowISO(),
    };
    setMaintenanceEvents((prev) => [newMaint, ...prev]);
    setMaintForm({ technician: "", actionTaken: "", partsReplaced: "", status: "Completed", timestamp: "" });
  };

  const addProductionStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopForm.startTime || !stopForm.endTime || !stopForm.equipment) return;
    const start = new Date(stopForm.startTime);
    const end = new Date(stopForm.endTime);
    const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));

    const newStop: ProductionStop = {
      id: "stop_" + Date.now(),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationMinutes: duration,
      equipment: stopForm.equipment.trim(),
      status: stopForm.status,
    };
    setProductionStops((prev) => [newStop, ...prev]);
    setStopForm({ startTime: "", endTime: "", equipment: "", status: "STOPPED" });
  };

  // Normalizer helper: Convert standard CSV timestamps into clean ISO-8601 UTC
  const normalizeTime = (input: string): string => {
    try {
      const parsed = new Date(input);
      if (isNaN(parsed.getTime())) {
        return getNowISO(); // Fallback if invalid
      }
      if (timezoneOffset !== 0) {
        const offsetTime = new Date(parsed.getTime() + timezoneOffset * 60 * 60 * 1000);
        return offsetTime.toISOString();
      }
      return parsed.toISOString();
    } catch {
      return getNowISO();
    }
  };

  // Handle Log Ingestion / File Parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseAndIngestFile(file);
  };

  const parseAndIngestFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        // Set up an inline Web Worker using a Blob URL to offload parsing
        const workerScript = `
          self.onmessage = function(e) {
            const { text, fileName } = e.data;
            try {
              if (fileName.endsWith(".json")) {
                const parsed = JSON.parse(text);
                self.postMessage({ success: true, data: parsed, isJson: true });
              } else {
                const lines = text.split("\\n").map(l => l.trim()).filter(l => l.length > 0);
                if (lines.length < 2) {
                  self.postMessage({ success: true, data: [], isJson: false });
                  return;
                }

                const headers = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/['"]/g, ""));
                const parsedRows = lines.slice(1).map(line => {
                  const values = line.split(",").map(v => v.trim().replace(/['"]/g, ""));
                  const obj = {};
                  headers.forEach((h, idx) => {
                    if (values[idx] !== undefined) {
                      obj[h] = values[idx];
                    }
                  });
                  return obj;
                });

                self.postMessage({ success: true, data: parsedRows, isJson: false });
              }
            } catch (err) {
              self.postMessage({ success: false, error: err.message });
            }
          };
        `;

        const blob = new Blob([workerScript], { type: "application/javascript" });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);

        worker.onmessage = (e) => {
          // Clean up worker resources
          URL.revokeObjectURL(workerUrl);
          worker.terminate();

          const { success, data, error, isJson } = e.data;
          if (success) {
            if (isJson && !Array.isArray(data)) {
              alert("JSON file must be an array of objects.");
            } else {
              ingestArray(data);
            }
          } else {
            alert("Parsing error inside Web Worker: " + error);
          }
        };

        worker.postMessage({ text, fileName: file.name });
      } catch (err) {
        console.warn("Blob Worker setup failed, falling back to synchronous parsing in main thread:", err);
        // Fallback parsing logic on main thread
        try {
          if (file.name.endsWith(".json")) {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
              ingestArray(parsed);
            } else {
              alert("JSON file must be an array of objects.");
            }
          } else {
            const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
            if (lines.length < 2) return;

            const headers = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/['"]/g, ""));
            const parsedRows = lines.slice(1).map((line) => {
              const values = line.split(",").map((v) => v.trim().replace(/['"]/g, ""));
              const obj: { [key: string]: string } = {};
              headers.forEach((h, idx) => {
                if (values[idx] !== undefined) {
                  obj[h] = values[idx];
                }
              });
              return obj;
            });

            ingestArray(parsedRows);
          }
        } catch (fallbackErr) {
          console.error(fallbackErr);
          alert("Failed to parse file. Ensure it is a valid PLC CSV or JSON stream.");
        }
      }
    };
    reader.readAsText(file);
  };

  const ingestArray = (arr: any[]) => {
    // Dynamically detect type of columns and auto-route
    const first = arr[0];
    if (!first) return;

    // Helper to search row value with optional custom header fallback
    const getValue = (row: any, standardKey: string, customKey: string) => {
      let val = "";
      if (customKey.trim() && customKey.trim() in row) {
        val = row[customKey.trim()];
      } else if (customKey.trim().toLowerCase() in row) {
        val = row[customKey.trim().toLowerCase()];
      } else if (standardKey in row) {
        val = row[standardKey];
      } else if (standardKey.toLowerCase() in row) {
        val = row[standardKey.toLowerCase()];
      }
      
      // Perform text replacement if configured
      if (typeof val === "string" && substitutionFrom.trim() && substitutionTo.trim()) {
        try {
          const regex = new RegExp(substitutionFrom.trim(), "g");
          val = val.replace(regex, substitutionTo.trim());
        } catch (e) {
          // If regex is invalid, do a literal search/replace
          val = val.split(substitutionFrom.trim()).join(substitutionTo.trim());
        }
      }
      return val;
    };

    // Detect PLC Alarm
    const isPlc = "tag" in first || "message" in first || "severity" in first || 
                  (customTagCol.trim() && customTagCol.trim() in first) ||
                  (customMsgCol.trim() && customMsgCol.trim() in first);

    if (isPlc) {
      const newAlarms: PLCAlarm[] = arr.map((row, index) => {
        const tag = getValue(row, "tag", customTagCol) || "PLC_TAG";
        const message = getValue(row, "message", customMsgCol) || row.alarm_message || "System Status Alert";
        const rawTime = getValue(row, "timestamp", customTimeCol) || row.time || row.date;
        const severityRaw = getValue(row, "severity", "") || "WARNING";
        const severity = severityRaw.toUpperCase() === "CRITICAL" ? "CRITICAL" : severityRaw.toUpperCase() === "INFO" ? "INFO" : "WARNING";

        return {
          id: `plc_ingest_${index}_${Date.now()}`,
          tag: String(tag).toUpperCase(),
          message: String(message),
          severity,
          timestamp: normalizeTime(String(rawTime)),
        };
      });
      setPlcAlarms((prev) => [...newAlarms, ...prev]);
      setActiveTab("plc");
    }
    // Detect Operator Log
    else if ("operator" in first || "observation" in first || "operatorname" in first) {
      const newLogs: OperatorLog[] = arr.map((row, index) => {
        const opName = getValue(row, "operator", "") || row.operatorname || "External Import";
        const observation = getValue(row, "observation", "") || row.note || row.log || "No message";
        const rawTime = getValue(row, "timestamp", "") || row.time;

        return {
          id: `op_ingest_${index}_${Date.now()}`,
          operatorName: String(opName),
          observation: String(observation),
          machineryState: row.state || row.machinerystate || "RUNNING",
          timestamp: normalizeTime(String(rawTime)),
        };
      });
      setOperatorLogs((prev) => [...newLogs, ...prev]);
      setActiveTab("operator");
    }
    // Detect Maintenance Event
    else if ("technician" in first || "action" in first || "actiontaken" in first) {
      const newMaint: MaintenanceEvent[] = arr.map((row, index) => {
        const tech = getValue(row, "technician", "") || row.tech || "Contractor Team";
        const action = getValue(row, "actiontaken", "") || row.action || "Standard servicing";
        const rawTime = getValue(row, "timestamp", "") || row.time;

        return {
          id: `maint_ingest_${index}_${Date.now()}`,
          technician: String(tech),
          actionTaken: String(action),
          partsReplaced: row.partsreplaced || row.parts || undefined,
          status: (row.status || "Completed") === "Completed" ? "Completed" : "In-Progress",
          timestamp: normalizeTime(String(rawTime)),
        };
      });
      setMaintenanceEvents((prev) => [...newMaint, ...prev]);
      setActiveTab("maintenance");
    }
    // Detect Production Stop
    else if ("start" in first || "starttime" in first || "duration" in first) {
      const newStops: ProductionStop[] = arr.map((row, index) => {
        const startRaw = getValue(row, "start", "") || row.starttime;
        const endRaw = getValue(row, "end", "") || row.endtime;
        const durationRaw = getValue(row, "duration", "") || row.durationminutes || "15";

        const start = normalizeTime(String(startRaw));
        const end = endRaw ? normalizeTime(String(endRaw)) : new Date(new Date(start).getTime() + (parseInt(String(durationRaw || "15")) * 60000)).toISOString();
        const duration = parseInt(String(durationRaw));

        return {
          id: `stop_ingest_${index}_${Date.now()}`,
          startTime: start,
          endTime: end,
          durationMinutes: isNaN(duration) ? 15 : duration,
          equipment: row.equipment || row.machine || "Unknown Line",
          status: row.status || "STOPPED",
        };
      });
      setProductionStops((prev) => [...newStops, ...prev]);
      setActiveTab("stops");
    } else {
      alert("Columns unrecognized. CSV headers must contain 'tag', 'operator', 'technician', or 'duration' to auto-detect log classification.");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseAndIngestFile(e.dataTransfer.files[0]);
    }
  };

  // Time formatter
  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toISOString().replace("T", " ").substring(0, 19) + " UTC";
    } catch {
      return ts;
    }
  };

  return (
    <div className="bg-[#16191f] rounded-sm border border-industrial p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-tight">
            <FileSpreadsheet className="h-4 w-4 text-amber-500" />
            Line Diagnostics Data Hub
          </h2>
          <p className="text-[11px] text-slate-400">
            View raw log tables, add manual events, or upload physical factory CSV records to correlate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Advanced Cleaning Rule Trigger */}
          <button
            onClick={() => setShowCleaningRules(!showCleaningRules)}
            className={`px-3 py-1.5 rounded-sm border text-[10px] font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer h-9 ${
              showCleaningRules 
                ? "bg-amber-500 text-black border-amber-500 font-bold" 
                : "bg-[#12151a] text-slate-300 border-industrial hover:bg-[#1c2026]"
            }`}
            title="Configure advanced mapping and text replacement"
          >
            ⚙️ Ingestion Rules {showCleaningRules ? "[ACTIVE]" : ""}
          </button>

          {/* Drag and Drop File Uploader */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm border border-dashed text-xs cursor-pointer transition-all h-9 ${
              dragActive
                ? "border-amber-500 bg-amber-500/10 text-white"
                : "border-industrial bg-[#12151a] text-slate-300 hover:border-slate-500 hover:bg-[#1c2026]"
            }`}
          >
            <Upload className="h-4 w-4 text-amber-500 shrink-0" />
            <div className="text-left leading-tight">
              <span className="font-semibold block uppercase tracking-wider text-[10px]">Upload CSV / JSON Log</span>
              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-tighter">Auto-normalizes and maps columns</span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Advanced Cleaning & Ingestion rules panel */}
      {showCleaningRules && (
        <div className="bg-[#12151a] border border-industrial p-4 rounded-sm mb-6 space-y-4">
          <div className="pb-2 border-b border-industrial/50">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-200">⚙️ Advanced Ingestion Rules & Data Cleaning</h3>
            <p className="text-[10px] text-slate-500">Configure client-side timezone normalization, header overrides, and log value substitutions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column Header Overrides */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold font-mono text-slate-300 uppercase block">1. Custom Column Mapping</span>
              <div className="space-y-1.5">
                <div>
                  <label className="text-[9px] font-mono text-slate-500 block uppercase">Map Custom Tag Header</label>
                  <input
                    type="text"
                    placeholder="e.g. error_code (defaults to 'tag')"
                    value={customTagCol}
                    onChange={(e) => setCustomTagCol(e.target.value)}
                    className="w-full bg-[#1c2026] text-slate-200 text-[11px] px-2.5 py-1 rounded-sm border border-industrial focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-slate-500 block uppercase">Map Custom Message Header</label>
                  <input
                    type="text"
                    placeholder="e.g. alarm_text (defaults to 'message')"
                    value={customMsgCol}
                    onChange={(e) => setCustomMsgCol(e.target.value)}
                    className="w-full bg-[#1c2026] text-slate-200 text-[11px] px-2.5 py-1 rounded-sm border border-industrial focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-slate-500 block uppercase">Map Custom Time Header</label>
                  <input
                    type="text"
                    placeholder="e.g. log_time (defaults to 'timestamp')"
                    value={customTimeCol}
                    onChange={(e) => setCustomTimeCol(e.target.value)}
                    className="w-full bg-[#1c2026] text-slate-200 text-[11px] px-2.5 py-1 rounded-sm border border-industrial focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Timezone normalization */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold font-mono text-slate-300 uppercase block">2. Timezone Correction</span>
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-slate-500 block uppercase">Hour Offset Adjustment</label>
                <select
                  value={timezoneOffset}
                  onChange={(e) => setTimezoneOffset(parseInt(e.target.value))}
                  className="w-full bg-[#1c2026] text-slate-200 text-[11px] px-2.5 py-1.5 rounded-sm border border-industrial focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value={0}>No correction (Keep CSV raw timestamp)</option>
                  <option value={-5}>-5 Hours (EST/EDT offset correction)</option>
                  <option value={-8}>-8 Hours (PST/PDT offset correction)</option>
                  <option value={1}>+1 Hour (CET offset correction)</option>
                  <option value={2}>+2 Hours (EET offset correction)</option>
                  <option value={8}>+8 Hours (SGT/CST offset correction)</option>
                  <option value={9}>+9 Hours (JST offset correction)</option>
                  <option value={-1}>-1 Hour</option>
                  <option value={-2}>-2 Hours</option>
                  <option value={-3}>-3 Hours</option>
                  <option value={-4}>-4 Hours</option>
                  <option value={-6}>-6 Hours</option>
                  <option value={-7}>-7 Hours</option>
                  <option value={3}>+3 Hours</option>
                  <option value={4}>+4 Hours</option>
                  <option value={5}>+5 Hours</option>
                  <option value={6}>+6 Hours</option>
                  <option value={7}>+7 Hours</option>
                </select>
                <p className="text-[9px] text-slate-500 leading-normal font-mono uppercase mt-1">
                  Used if factory machines log in local timezone but database requires UTC timestamps.
                </p>
              </div>
            </div>

            {/* Keyword substitution rules */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold font-mono text-slate-300 uppercase block">3. Ingestion Value Substitutions</span>
              <div className="space-y-1.5">
                <div>
                  <label className="text-[9px] font-mono text-slate-500 block uppercase">Search String / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. ERR_SYS_1"
                    value={substitutionFrom}
                    onChange={(e) => setSubstitutionFrom(e.target.value)}
                    className="w-full bg-[#1c2026] text-slate-200 text-[11px] px-2.5 py-1 rounded-sm border border-industrial focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-slate-500 block uppercase">Replace with Description</label>
                  <input
                    type="text"
                    placeholder="e.g. CONVEYOR_BELT_SLIP"
                    value={substitutionTo}
                    onChange={(e) => setSubstitutionTo(e.target.value)}
                    className="w-full bg-[#1c2026] text-slate-200 text-[11px] px-2.5 py-1 rounded-sm border border-industrial focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <p className="text-[9px] text-slate-500 leading-normal font-mono uppercase mt-1">
                  Replaces cryptic codes with human-readable alarm tags during ingestion.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-industrial pb-3">
        <button
          onClick={() => setActiveTab("plc")}
          className={`px-3 py-1.5 rounded-sm text-[11px] font-bold font-display uppercase tracking-wider transition ${
            activeTab === "plc" ? "bg-amber-500 text-black" : "text-slate-400 hover:text-slate-200 hover:bg-[#12151a]"
          }`}
        >
          PLC Alarms ({plcAlarms.length})
        </button>
        <button
          onClick={() => setActiveTab("operator")}
          className={`px-3 py-1.5 rounded-sm text-[11px] font-bold font-display uppercase tracking-wider transition ${
            activeTab === "operator" ? "bg-amber-500 text-black" : "text-slate-400 hover:text-slate-200 hover:bg-[#12151a]"
          }`}
        >
          Operator Shift Notes ({operatorLogs.length})
        </button>
        <button
          onClick={() => setActiveTab("maintenance")}
          className={`px-3 py-1.5 rounded-sm text-[11px] font-bold font-display uppercase tracking-wider transition ${
            activeTab === "maintenance" ? "bg-amber-500 text-black" : "text-slate-400 hover:text-slate-200 hover:bg-[#12151a]"
          }`}
        >
          Maintenance Action Log ({maintenanceEvents.length})
        </button>
        <button
          onClick={() => setActiveTab("stops")}
          className={`px-3 py-1.5 rounded-sm text-[11px] font-bold font-display uppercase tracking-wider transition ${
            activeTab === "stops" ? "bg-amber-500 text-black" : "text-slate-400 hover:text-slate-200 hover:bg-[#12151a]"
          }`}
        >
          Production Stops ({productionStops.length})
        </button>
      </div>

      {/* Table & Forms View */}
      <div className="mt-4">
        {activeTab === "plc" && (
          <div className="space-y-4">
            {/* Inline Add Row Form */}
            <form onSubmit={addPlcAlarm} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#12151a] p-3 rounded-sm border border-industrial">
              <input
                type="text"
                placeholder="Alarm Register (e.g. VFD_TRIP_A)"
                value={plcForm.tag}
                onChange={(e) => setPlcForm((prev) => ({ ...prev, tag: e.target.value }))}
                className="bg-[#1c2026] text-slate-100 text-xs px-3 py-1.5 rounded-sm border border-industrial focus:outline-none focus:border-amber-500 font-mono"
              />
              <input
                type="text"
                placeholder="Diagnostic Message"
                value={plcForm.message}
                onChange={(e) => setPlcForm((prev) => ({ ...prev, message: e.target.value }))}
                className="bg-[#1c2026] text-slate-100 text-xs px-3 py-1.5 rounded-sm border border-industrial focus:outline-none focus:border-amber-500"
              />
              <div className="flex gap-2">
                <select
                  value={plcForm.severity}
                  onChange={(e) => setPlcForm((prev) => ({ ...prev, severity: e.target.value as any }))}
                  className="bg-[#1c2026] text-slate-300 text-xs px-2 py-1.5 rounded-sm border border-industrial focus:outline-none focus:border-amber-500 w-full font-mono text-[11px]"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="WARNING">WARNING</option>
                  <option value="INFO">INFO</option>
                </select>
                <input
                  type="datetime-local"
                  value={plcForm.timestamp}
                  onChange={(e) => setPlcForm((prev) => ({ ...prev, timestamp: e.target.value }))}
                  className="bg-[#1c2026] text-slate-300 text-[10px] px-2 py-1.5 rounded-sm border border-industrial focus:outline-none focus:border-amber-500 w-full font-mono"
                />
              </div>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-[11px] px-4 py-1.5 rounded-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add PLC Alarm
              </button>
            </form>

            {/* PLC Table */}
            <div className="overflow-x-auto rounded-sm border border-industrial">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#12151a] border-b border-industrial text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-2.5">Timestamp (UTC normalized)</th>
                    <th className="p-2.5">Tag/Register</th>
                    <th className="p-2.5">Alarm Message</th>
                    <th className="p-2.5 text-center">Severity</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2026]/40 bg-[#12151a]/30">
                  {plcAlarms.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 italic">No alarms logged</td>
                    </tr>
                  ) : (
                    plcAlarms.map((a) => (
                      <tr key={a.id} className="hover:bg-[#1c2026]/50 transition font-mono">
                        <td className="p-2.5 text-slate-500">{formatTime(a.timestamp)}</td>
                        <td className="p-2.5 font-bold text-slate-200">{a.tag}</td>
                        <td className="p-2.5 text-slate-300 font-sans">{a.message}</td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                              a.severity === "CRITICAL"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : a.severity === "WARNING"
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            }`}
                          >
                            {a.severity}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => setPlcAlarms((prev) => prev.filter((item) => item.id !== a.id))}
                            className="text-slate-500 hover:text-red-400 p-1 rounded-sm hover:bg-[#1c2026] transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "operator" && (
          <div className="space-y-4">
            {/* Operator Add Form */}
            <form onSubmit={addOperatorLog} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#12151a] p-3 rounded-sm border border-industrial">
              <input
                type="text"
                placeholder="Operator Name"
                value={opForm.operatorName}
                onChange={(e) => setOpForm((prev) => ({ ...prev, operatorName: e.target.value }))}
                className="bg-[#1c2026] text-slate-100 text-xs px-3 py-1.5 rounded-sm border border-industrial focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Observation or Action"
                value={opForm.observation}
                onChange={(e) => setOpForm((prev) => ({ ...prev, observation: e.target.value }))}
                className="bg-[#1c2026] text-slate-100 text-xs px-3 py-1.5 rounded-sm border border-industrial focus:outline-none focus:border-amber-500"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Machinery State (e.g. RUNNING)"
                  value={opForm.machineryState}
                  onChange={(e) => setOpForm((prev) => ({ ...prev, machineryState: e.target.value }))}
                  className="bg-[#1c2026] text-slate-100 text-xs px-3 py-1.5 rounded-sm border border-industrial focus:outline-none focus:border-amber-500 w-full"
                />
                <input
                  type="datetime-local"
                  value={opForm.timestamp}
                  onChange={(e) => setOpForm((prev) => ({ ...prev, timestamp: e.target.value }))}
                  className="bg-[#1c2026] text-slate-300 text-[10px] px-2 py-1.5 rounded-sm border border-industrial focus:outline-none focus:border-amber-500 w-full font-mono"
                />
              </div>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-[11px] px-4 py-1.5 rounded-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Note
              </button>
            </form>

            {/* Operator Table */}
            <div className="overflow-x-auto rounded-sm border border-industrial">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#12151a] border-b border-industrial text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Operator</th>
                    <th className="p-2.5">Observation Log</th>
                    <th className="p-2.5 text-center">Equipment State</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2026]/40 bg-[#12151a]/30">
                  {operatorLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 italic">No notes logged</td>
                    </tr>
                  ) : (
                    operatorLogs.map((o) => (
                      <tr key={o.id} className="hover:bg-[#1c2026]/50 transition">
                        <td className="p-2.5 text-slate-500 font-mono">{formatTime(o.timestamp)}</td>
                        <td className="p-2.5 font-bold text-amber-500 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-500" />
                          {o.operatorName}
                        </td>
                        <td className="p-2.5 text-slate-200">{o.observation}</td>
                        <td className="p-2.5 text-center font-mono">
                          <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${o.machineryState === "STOPPED" ? "bg-rose-500/15 text-rose-400 border border-rose-500/10" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/10"}`}>
                            {o.machineryState}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => setOperatorLogs((prev) => prev.filter((item) => item.id !== o.id))}
                            className="text-slate-500 hover:text-red-400 p-1 rounded-sm hover:bg-[#1c2026] transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="space-y-4">
            {/* Maintenance Add Form */}
            <form onSubmit={addMaintenanceEvent} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#12151a] p-3 rounded-sm border border-industrial">
              <input
                type="text"
                placeholder="Technician/Engineer"
                value={maintForm.technician}
                onChange={(e) => setMaintForm((prev) => ({ ...prev, technician: e.target.value }))}
                className="bg-[#1c2026] text-slate-100 text-xs px-3 py-1.5 rounded-sm border border-industrial focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Action Taken"
                value={maintForm.actionTaken}
                onChange={(e) => setMaintForm((prev) => ({ ...prev, actionTaken: e.target.value }))}
                className="bg-[#1c2026] text-slate-100 text-xs px-3 py-1.5 rounded-sm border border-industrial focus:outline-none focus:border-amber-500"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Parts Replaced (Optional)"
                  value={maintForm.partsReplaced}
                  onChange={(e) => setMaintForm((prev) => ({ ...prev, partsReplaced: e.target.value }))}
                  className="bg-[#1c2026] text-slate-100 text-xs px-3 py-1.5 rounded-sm border border-industrial focus:outline-none focus:border-amber-500 w-full"
                />
                <input
                  type="datetime-local"
                  value={maintForm.timestamp}
                  onChange={(e) => setMaintForm((prev) => ({ ...prev, timestamp: e.target.value }))}
                  className="bg-[#1c2026] text-slate-300 text-[10px] px-2 py-1.5 rounded-sm border border-industrial focus:outline-none focus:border-amber-500 w-full font-mono"
                />
              </div>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-[11px] px-4 py-1.5 rounded-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Log Service
              </button>
            </form>

            {/* Maintenance Table */}
            <div className="overflow-x-auto rounded-sm border border-industrial">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#12151a] border-b border-industrial text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Technician</th>
                    <th className="p-2.5">Service Action Taken</th>
                    <th className="p-2.5">Parts Replaced</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2026]/40 bg-[#12151a]/30">
                  {maintenanceEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500 italic">No maintenance actions logged</td>
                    </tr>
                  ) : (
                    maintenanceEvents.map((m) => (
                      <tr key={m.id} className="hover:bg-[#1c2026]/50 transition">
                        <td className="p-2.5 text-slate-500 font-mono">{formatTime(m.timestamp)}</td>
                        <td className="p-2.5 font-bold text-amber-500 flex items-center gap-1.5">
                          <Wrench className="h-3.5 w-3.5 text-slate-500" />
                          {m.technician}
                        </td>
                        <td className="p-2.5 text-slate-200">{m.actionTaken}</td>
                        <td className="p-2.5 font-mono text-slate-400">{m.partsReplaced || "None"}</td>
                        <td className="p-2.5 text-center font-mono">
                          <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => setMaintenanceEvents((prev) => prev.filter((item) => item.id !== m.id))}
                            className="text-slate-500 hover:text-red-400 p-1 rounded-sm hover:bg-[#1c2026] transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "stops" && (
          <div className="space-y-4">
            {/* Production Stop Form */}
            <form onSubmit={addProductionStop} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#12151a] p-3 rounded-sm border border-industrial">
              <input
                type="text"
                placeholder="Equipment (e.g. Line A)"
                value={stopForm.equipment}
                onChange={(e) => setStopForm((prev) => ({ ...prev, equipment: e.target.value }))}
                className="bg-[#1c2026] text-slate-100 text-xs px-3 py-1.5 rounded-sm border border-industrial focus:outline-none focus:border-amber-500"
              />
              <div className="flex gap-2 col-span-2">
                <div className="w-full">
                  <label className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block mb-0.5">Stop Start (UTC)</label>
                  <input
                    type="datetime-local"
                    value={stopForm.startTime}
                    onChange={(e) => setStopForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="bg-[#1c2026] text-slate-300 text-[10px] px-2 py-1.5 rounded-sm border border-industrial focus:outline-none focus:border-amber-500 w-full font-mono"
                  />
                </div>
                <div className="w-full">
                  <label className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block mb-0.5">Stop End (UTC)</label>
                  <input
                    type="datetime-local"
                    value={stopForm.endTime}
                    onChange={(e) => setStopForm((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="bg-[#1c2026] text-slate-300 text-[10px] px-2 py-1.5 rounded-sm border border-industrial focus:outline-none focus:border-amber-500 w-full font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-[11px] px-4 py-1.5 rounded-sm transition flex items-center justify-center gap-1.5 self-end cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Log Stop Event
              </button>
            </form>

            {/* Stops Table */}
            <div className="overflow-x-auto rounded-sm border border-industrial">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#12151a] border-b border-industrial text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-2.5">Start Time</th>
                    <th className="p-2.5">End Time</th>
                    <th className="p-2.5 text-center">Duration</th>
                    <th className="p-2.5">Equipment</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2026]/40 bg-[#12151a]/30">
                  {productionStops.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500 italic">No stoppages logged</td>
                    </tr>
                  ) : (
                    productionStops.map((s) => (
                      <tr key={s.id} className="hover:bg-[#1c2026]/50 transition font-mono">
                        <td className="p-2.5 text-slate-500">{formatTime(s.startTime)}</td>
                        <td className="p-2.5 text-slate-500">{formatTime(s.endTime)}</td>
                        <td className="p-2.5 text-center text-rose-400 font-bold">{s.durationMinutes} MIN</td>
                        <td className="p-2.5 text-slate-200 font-sans font-bold uppercase text-[10px] tracking-tight">{s.equipment}</td>
                        <td className="p-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-sans">
                          <button
                            onClick={() => setProductionStops((prev) => prev.filter((item) => item.id !== s.id))}
                            className="text-slate-500 hover:text-red-400 p-1 rounded-sm hover:bg-[#1c2026] transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
