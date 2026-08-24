import React, { useState, useRef } from "react";
import { 
  FileCode, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Upload, 
  Copy, 
  Check, 
  RefreshCw, 
  Code2, 
  BookOpen, 
  Play, 
  Terminal,
  Zap,
  Cpu,
  ChevronRight,
  ArrowRight
} from "lucide-react";

interface PLCReviewIssue {
  type: "SAFETY" | "DEAD_CODE" | "NAMING" | "LOGIC";
  severity: "CRITICAL" | "WARNING" | "INFO";
  line: number;
  rule: string;
  message: string;
  suggestion: string;
}

interface PLCReviewAudit {
  score: number;
  standardsCompliance: string;
  controllerTarget: string;
  summary: string;
  issues: PLCReviewIssue[];
  refactoredCode: string;
}

const SAMPLE_PROGRAMS = [
  {
    id: "siemens_conveyor",
    name: "Siemens S7-1500 - Infeed Conveyor (Flawed Safety & Dead Code)",
    target: "Siemens S7-1500 (TIA Portal v19)",
    standard: "IEC 61131-3 & ISO 13849-1",
    code: `// SIEMENS S7-1500 - INFEED PACKAGING CONVEYOR CONTROL
// BLOCK: FB_InfeedConveyor (Structured Text)

VAR_INPUT
    start_button : BOOL;
    stop_button : BOOL;
    pe_402_sensor : BOOL;
    motor_overload_trip : BOOL;
    curtain_broken : BOOL;
END_VAR

VAR_OUTPUT
    conveyor_drive_run : BOOL;
    alarm_lamp : BOOL;
    speed_setpoint : REAL;
END_VAR

VAR
    cycle_counter : INT;
    temp_speed : REAL;
    debug_bypass : BOOL := TRUE; // WARNING: Permanent debug flag left active
END_VAR

// Main State Logic
IF start_button AND NOT stop_button THEN
    // CRITICAL SAFETY OMISSION: No check on safety curtain or hardware E-Stop
    IF NOT motor_overload_trip THEN
        conveyor_drive_run := TRUE;
        speed_setpoint := 1.25; // m/s
    END_IF;
END_IF;

IF pe_402_sensor AND NOT debug_bypass THEN
    // DEAD CODE: debug_bypass is hardcoded to TRUE, so automatic backup pause is never reached
    conveyor_drive_run := FALSE;
    alarm_lamp := TRUE;
END_IF;

IF stop_button THEN
    conveyor_drive_run := FALSE;
END_IF;
`
  },
  {
    id: "beckhoff_motion",
    name: "Beckhoff TwinCAT 3 - Multi-Axis Indexer (Hungarian Deviations)",
    target: "Beckhoff TwinCAT 3 (e!COCKPIT / Codesys)",
    standard: "PLCopen Motion Control & IEC 61131-3",
    code: `// BECKHOFF TWINCAT 3 - PACKAGING INDEXER STATE MACHINE
// POU: AxisIndexer_ST

VAR
    state : INT := 0;
    target_pos : REAL := 350.0;
    actual_pos : REAL;
    move_velocity : REAL := 45.0;
    homed_flag : BOOL := FALSE;
    timer_delay : TIME := T#500MS;
    g_bOverrideSafety : BOOL := FALSE;
END_VAR

CASE state OF
    0: // Idle state
        IF homed_flag THEN
            state := 10;
        END_IF;
        
    10: // Motion Command
        // Flaw: Unlatched motion command without hardware limit switch guards
        actual_pos := actual_pos + 10.0;
        IF actual_pos >= target_pos THEN
            state := 20;
        END_IF;
        
    20: // Completed
        IF FALSE THEN
            // Unreachable dead code branch
            actual_pos := 0.0;
        END_IF;
        state := 0;
END_CASE;
`
  },
  {
    id: "rockwell_sealer",
    name: "Rockwell Studio 5000 - Flow Wrapper Sealer (Thermal Runaway Risk)",
    target: "Rockwell ControlLogix 5580",
    standard: "IEC 61131-3 Edition 3",
    code: `// ROCKWELL CONTROLLOGIX 5580 - FLOW WRAPPER THERMAL HEATER
// ROUTINE: HeatSealer_Ctrl

VAR_INPUT
    actual_temp : REAL;
    setpoint_temp : REAL := 185.0;
    thermocouple_fault : BOOL;
END_VAR

VAR_OUTPUT
    heater_ssr_output : BOOL;
    overtemp_trip : BOOL;
END_VAR

VAR
    duty_cycle_acc : INT;
    max_safe_temp : REAL := 210.0;
END_VAR

// Bang-bang heater control logic
IF actual_temp < setpoint_temp THEN
    heater_ssr_output := TRUE;
ELSIF actual_temp >= setpoint_temp THEN
    heater_ssr_output := FALSE;
END_IF;

// Runaway condition check
IF actual_temp > max_safe_temp THEN
    // Defect: Over-temp trips flag but fails to force heater_ssr_output LOW
    overtemp_trip := TRUE;
END_IF;
`
  }
];

export default function PlcCodeReview() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("siemens_conveyor");
  const [code, setCode] = useState<string>(SAMPLE_PROGRAMS[0].code);
  const [targetController, setTargetController] = useState<string>(SAMPLE_PROGRAMS[0].target);
  const [standard, setStandard] = useState<string>(SAMPLE_PROGRAMS[0].standard);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<PLCReviewAudit | null>(null);
  const [activeTab, setActiveTab] = useState<"audit" | "refactored" | "rules">("audit");
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Preset Switching
  const handlePresetChange = (presetId: string) => {
    const p = SAMPLE_PROGRAMS.find((item) => item.id === presetId);
    if (p) {
      setSelectedPresetId(presetId);
      setCode(p.code);
      setTargetController(p.target);
      setStandard(p.standard);
      setAuditResult(null);
    }
  };

  // Handle File Upload (.st, .xml, .exp, .txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCode(content);
        setSelectedPresetId("custom");
        setAuditResult(null);
      }
    };
    reader.readAsText(file);
  };

  // Trigger Static & Gemini Safety Code Audit
  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch("/api/plc-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          targetController,
          standard,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAuditResult(data.audit);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to audit code");
      }
    } catch (e) {
      console.error("Audit error", e);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCopyRefactored = () => {
    if (!auditResult?.refactoredCode) return;
    navigator.clipboard.writeText(auditResult.refactoredCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyRefactoredToEditor = () => {
    if (!auditResult?.refactoredCode) return;
    setCode(auditResult.refactoredCode);
    setActiveTab("audit");
  };

  return (
    <div className="bg-[#16191f] rounded-sm border border-industrial p-5 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-industrial pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-amber-500" />
            <h2 className="font-display text-sm font-bold text-slate-100 uppercase tracking-wide">
              PLC Code Review & Safety Logic Auditor (IEC 61131-3)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pre-commissioning static analysis and AI safety auditing for Structured Text (ST) and PLCopen XML logic.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".st,.xml,.exp,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-[#12151a] hover:bg-[#1c2026] text-slate-300 rounded-sm border border-industrial text-xs font-mono flex items-center gap-1.5 cursor-pointer transition"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload .ST / .XML
          </button>

          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs rounded-sm flex items-center gap-1.5 cursor-pointer transition shadow-sm"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isAuditing ? "animate-spin" : ""}`} />
            {isAuditing ? "Auditing Safety & Standards..." : "Run AI Safety Audit"}
          </button>
        </div>
      </div>

      {/* Preset Program Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SAMPLE_PROGRAMS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetChange(preset.id)}
            className={`p-3 rounded-sm border text-left cursor-pointer transition ${
              selectedPresetId === preset.id
                ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30"
                : "border-industrial bg-[#12151a] hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                {preset.target.split(" ")[0]} PRESET
              </span>
              {selectedPresetId === preset.id && <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />}
            </div>
            <h4 className="text-xs font-bold text-slate-200 mt-1 line-clamp-1">{preset.name}</h4>
            <span className="text-[10px] font-mono text-slate-500 block mt-1">{preset.standard}</span>
          </button>
        ))}
      </div>

      {/* Code Editor & Configuration Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor */}
        <div className="lg:col-span-6 space-y-2 flex flex-col">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-amber-500" />
              Structured Text (ST) Editor
            </span>
            <span>{code.split("\n").length} Lines</span>
          </div>

          <div className="relative flex-1 bg-[#0b0d10] border border-industrial rounded-sm overflow-hidden font-mono text-xs">
            <textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setSelectedPresetId("custom");
              }}
              rows={18}
              className="w-full h-full p-3 bg-transparent text-slate-200 font-mono text-xs focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Column: Audit Results & Refactored Diff */}
        <div className="lg:col-span-6 space-y-4 flex flex-col">
          {/* Sub-tabs */}
          <div className="flex items-center justify-between border-b border-industrial pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("audit")}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-sm transition cursor-pointer ${
                  activeTab === "audit"
                    ? "bg-amber-500 text-black font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Audit Findings {auditResult?.issues ? `(${auditResult.issues.length})` : ""}
              </button>
              <button
                onClick={() => setActiveTab("refactored")}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-sm transition cursor-pointer ${
                  activeTab === "refactored"
                    ? "bg-amber-500 text-black font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Refactored ST Code
              </button>
            </div>

            {auditResult && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">Health Score:</span>
                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                    auditResult.score >= 85
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : auditResult.score >= 60
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {auditResult.score}/100
                </span>
              </div>
            )}
          </div>

          {/* Tab Content: Findings */}
          {activeTab === "audit" && (
            <div className="flex-1 space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {!auditResult ? (
                <div className="bg-[#12151a] p-8 text-center rounded-sm border border-industrial space-y-3 my-auto">
                  <Cpu className="h-8 w-8 text-amber-500 mx-auto opacity-70" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase">Awaiting Code Audit</h4>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      Click <strong className="text-amber-400 font-semibold">"Run AI Safety Audit"</strong> to scan your Structured Text for missing hardware safety interlocks, dead branches, and IEC 61131-3 Hungarian notation defects.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-[#12151a] p-3 rounded-sm border border-industrial text-xs text-slate-300">
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block mb-1">
                      Audit Summary
                    </span>
                    <p className="text-[11px] leading-relaxed">{auditResult.summary}</p>
                  </div>

                  {auditResult.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-sm border space-y-1.5 transition ${
                        issue.severity === "CRITICAL"
                          ? "bg-[#1c1214] border-rose-500/40"
                          : issue.severity === "WARNING"
                          ? "bg-[#1c1812] border-amber-500/40"
                          : "bg-[#12151a] border-industrial"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              issue.severity === "CRITICAL"
                                ? "bg-rose-500 text-black"
                                : issue.severity === "WARNING"
                                ? "bg-amber-500 text-black"
                                : "bg-sky-500 text-black"
                            }`}
                          >
                            {issue.severity}
                          </span>
                          <span className="text-slate-200 font-bold">{issue.rule}</span>
                        </div>
                        <span className="text-slate-400">Line {issue.line}</span>
                      </div>

                      <p className="text-xs text-slate-300">{issue.message}</p>

                      <div className="bg-[#0b0d10] p-2 rounded border border-industrial text-[11px] font-mono text-emerald-400">
                        <span className="text-slate-500 text-[9px] uppercase block">Remediation:</span>
                        {issue.suggestion}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Tab Content: Refactored Code */}
          {activeTab === "refactored" && (
            <div className="flex-1 space-y-2 flex flex-col">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>AI-Corrected Structured Text</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyRefactored}
                    className="px-2 py-1 bg-[#12151a] hover:bg-[#1c2026] text-slate-300 rounded border border-industrial text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy Code"}
                  </button>
                  <button
                    onClick={handleApplyRefactoredToEditor}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black rounded font-mono font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRight className="h-3 w-3" />
                    Load in Editor
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-[#0b0d10] border border-industrial rounded-sm p-3 overflow-y-auto font-mono text-xs text-emerald-300 leading-relaxed max-h-[380px]">
                {auditResult?.refactoredCode ? (
                  <pre>{auditResult.refactoredCode}</pre>
                ) : (
                  <div className="text-slate-600 italic text-center py-12">
                    Execute an audit to generate refactored, standard-compliant code.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
