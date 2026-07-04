import { useState, useEffect } from "react";
import { PLCAlarm, OperatorLog, MaintenanceEvent, ProductionStop } from "../data/scenarios";
import { Sparkles, BrainCircuit, ShieldCheck, Hammer, HelpCircle, AlertCircle, FileText, Share2 } from "lucide-react";
import { motion } from "motion/react";

interface RootCauseReportProps {
  plcAlarms: PLCAlarm[];
  operatorLogs: OperatorLog[];
  maintenanceEvents: MaintenanceEvent[];
  productionStops: ProductionStop[];
}

interface AIReport {
  executiveSummary: string;
  fiveWhys: string[];
  likelyCauses: {
    category: string;
    cause: string;
    confidence: number;
    evidence: string;
  }[];
  recommendedActions: {
    type: string;
    action: string;
    owner: string;
    impact: string;
  }[];
  precursorAlert: string;
}

export default function RootCauseReport({
  plcAlarms,
  operatorLogs,
  maintenanceEvents,
  productionStops,
}: RootCauseReportProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AIReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);

  const loadingMessages = [
    "Aligning cross-system timestamps to UTC...",
    "Correlating operator log entries with active registers...",
    "Scanning PLC alarm stream for statistical precursors...",
    "Synthesizing incident narrative into 5-Whys framework...",
    "Generating corrective and preventive (CAPA) actions..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingPhase((p) => (p + 1) % loadingMessages.length);
      }, 2500);
    } else {
      setLoadingPhase(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plcAlarms,
          operatorLogs,
          maintenanceEvents,
          productionStops,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze data.");
      }

      if (data.report) {
        setReport(data.report);
      } else {
        throw new Error("Invalid response format received from server.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred while communicating with the analysis server.");
    } finally {
      setLoading(false);
    }
  };

  const shareReport = () => {
    if (!report) return;
    const shareText = `Downtime Analyzer Report Summary:\n\n${report.executiveSummary}\n\n5 Whys:\n${report.fiveWhys.map((w, i) => `${i+1}. ${w}`).join("\n")}`;
    navigator.clipboard.writeText(shareText);
    alert("Analysis summary copied to clipboard!");
  };

  return (
    <div className="bg-[#16191f] rounded-sm border border-industrial p-5 mt-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-tight">
            <BrainCircuit className="h-4 w-4 text-amber-500" />
            AI Root Cause Analysis Engine
          </h2>
          <p className="text-[11px] text-slate-400">
            Synthesize all current telemetry, PLC logs, and shift notes into an executive report.
          </p>
        </div>
        <button
          onClick={generateReport}
          disabled={loading || plcAlarms.length === 0}
          className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-black font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-sm transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 shrink-0"
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          {loading ? "Analyzing Live Data..." : "Generate AI Root Cause Report"}
        </button>
      </div>

      {loading && (
        <div className="bg-[#12151a] rounded-sm border border-industrial p-8 flex flex-col items-center justify-center text-center">
          <div className="relative h-12 w-12 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-4 border-t-amber-500 border-r-transparent animate-spin" />
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-2 min-h-[24px]">
            {loadingMessages[loadingPhase]}
          </p>
          <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 mt-1">
            Running Gemini 3.5 Flash Model
          </span>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/15 border border-rose-500/20 rounded-sm p-4 flex gap-3 text-rose-400 text-xs">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-300 uppercase tracking-wider">Analysis Halted</h4>
            <p className="mt-1">{error}</p>
            <p className="mt-2 text-[10px] text-slate-500 font-mono">
              Please verify your API settings or load one of our scenarios to clear data parsing conflicts.
            </p>
          </div>
        </div>
      )}

      {!loading && !report && !error && (
        <div className="bg-[#12151a]/40 p-8 rounded-sm border border-dashed border-industrial text-center">
          <FileText className="h-8 w-8 text-slate-600 mx-auto mb-3" />
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Ready to generate report. Click the button above to execute statistical correlation and retrieve 5 Whys analysis from Gemini.
          </p>
        </div>
      )}

      {report && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Header Controls */}
          <div className="flex justify-between items-center bg-[#12151a] px-3.5 py-2 rounded-sm border border-industrial">
            <span className="text-[9px] font-mono text-emerald-500 flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Report Validated • ISO-8601 UTC Aligned
            </span>
            <button
              onClick={shareReport}
              className="text-[10px] uppercase font-bold text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-sm transition border border-industrial"
            >
              <Share2 className="h-3 w-3 text-slate-400" /> Share Summary
            </button>
          </div>

          {/* Executive Summary */}
          <div className="bg-amber-500/5 rounded-sm border border-amber-500/15 p-4">
            <h3 className="font-display text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Executive Summary</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{report.executiveSummary}</p>
          </div>

          {/* 5 Whys Analysis */}
          <div>
            <h3 className="font-display text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-amber-500" />
              5 Whys Root Cause Chain
            </h3>
            <div className="space-y-2 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-500/20">
              {report.fiveWhys.map((why, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-[#16191f]" />
                  <div className="bg-[#12151a] p-2.5 rounded-sm border border-industrial text-xs">
                    <span className="font-mono text-amber-500 font-bold block mb-0.5">WHY {idx + 1}</span>
                    <span className="text-slate-300 font-sans">{why}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Likely Causes & Confidence Gauges */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h3 className="font-display text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Identified Engineering Causes</h3>
              <div className="space-y-3">
                {report.likelyCauses.map((c, idx) => (
                  <div key={idx} className="bg-[#12151a] rounded-sm p-3 border border-industrial space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[9px] font-mono uppercase bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-sm border border-amber-500/15">
                          {c.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200 mt-1">{c.cause}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-amber-500">{c.confidence}%</span>
                        <span className="text-[8px] uppercase font-mono text-slate-500 block">Confidence</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-[#1c2026] h-1.5 rounded-sm overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-sm" style={{ width: `${c.confidence}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      <strong>Data Evidence:</strong> {c.evidence}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Precursor Warning & CAPA Actions */}
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Early Warning Precursor Tags</h3>
                <div className="bg-[#12151a] rounded-sm p-3 border border-industrial flex gap-2.5">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-500 uppercase tracking-wider">Predictive Alarm Signature:</span>
                    <p className="text-slate-300 mt-1 font-sans text-[11px] leading-relaxed">{report.precursorAlert}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-display text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Hammer className="h-4 w-4 text-amber-500" />
                  CAPA Preventive Actions
                </h3>
                <div className="overflow-x-auto rounded-sm border border-industrial">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-[#12151a] border-b border-industrial text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="p-2">Action Tasks</th>
                        <th className="p-2">Owner</th>
                        <th className="p-2 text-center">Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1c2026]/40 bg-[#12151a]/30">
                      {report.recommendedActions.map((act, idx) => (
                        <tr key={idx} className="hover:bg-[#1c2026]/50 transition">
                          <td className="p-2 text-slate-200">
                            <span className="font-bold text-[9px] uppercase font-mono block text-amber-500">
                              {act.type}
                            </span>
                            {act.action}
                          </td>
                          <td className="p-2 text-slate-400 font-mono">{act.owner}</td>
                          <td className="p-2 text-center font-mono font-bold text-emerald-500">
                            {act.impact}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
