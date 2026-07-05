import { useState } from "react";
import { PLCAlarm, OperatorLog, MaintenanceEvent, ProductionStop } from "../data/scenarios";
import { Clock, ShieldAlert, User, Wrench, AlertTriangle, ArrowRight, Download, Printer, X, FileSpreadsheet } from "lucide-react";

interface TimelineAlignmentProps {
  plcAlarms: PLCAlarm[];
  operatorLogs: OperatorLog[];
  maintenanceEvents: MaintenanceEvent[];
  productionStops: ProductionStop[];
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: "PLC" | "OPERATOR" | "MAINTENANCE" | "STOP_START" | "STOP_END";
  title: string;
  description: string;
  tagOrUserOrTech: string;
  severity?: "CRITICAL" | "WARNING" | "INFO" | "Completed" | "STOPPED";
  relativeOffsetMinutes?: number; // Minutes relative to the first stoppage
}

export default function TimelineAlignment({
  plcAlarms,
  operatorLogs,
  maintenanceEvents,
  productionStops,
}: TimelineAlignmentProps) {
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Combine, parse, and sort events chronologically
  const getCombinedTimeline = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Add PLC Alarms
    plcAlarms.forEach((a) => {
      events.push({
        id: a.id,
        timestamp: a.timestamp,
        type: "PLC",
        title: `PLC Alarm: ${a.tag}`,
        description: a.message,
        tagOrUserOrTech: a.tag,
        severity: a.severity,
      });
    });

    // Add Operator Logs
    operatorLogs.forEach((o) => {
      events.push({
        id: o.id,
        timestamp: o.timestamp,
        type: "OPERATOR",
        title: `Operator Observation - ${o.operatorName}`,
        description: `${o.observation} [State: ${o.machineryState}]`,
        tagOrUserOrTech: o.operatorName,
        severity: o.machineryState === "STOPPED" ? "CRITICAL" : "INFO",
      });
    });

    // Add Maintenance Events
    maintenanceEvents.forEach((m) => {
      events.push({
        id: m.id,
        timestamp: m.timestamp,
        type: "MAINTENANCE",
        title: `Maintenance Service: ${m.technician}`,
        description: `${m.actionTaken} ${m.partsReplaced ? `(Parts: ${m.partsReplaced})` : ""}`,
        tagOrUserOrTech: m.technician,
        severity: m.status === "Completed" ? "Completed" : "WARNING",
      });
    });

    // Add Production Stops (Both Start and End events for a clean swimlane mapping)
    productionStops.forEach((s) => {
      events.push({
        id: `${s.id}_start`,
        timestamp: s.startTime,
        type: "STOP_START",
        title: `DOWNTIME COMMENCED`,
        description: `Line halted. Duration: ${s.durationMinutes} minutes.`,
        tagOrUserOrTech: s.equipment,
        severity: "STOPPED",
      });

      if (s.endTime) {
        events.push({
          id: `${s.id}_end`,
          timestamp: s.endTime,
          type: "STOP_END",
          title: `PRODUCTION RESUMED`,
          description: `Line declared back in operation.`,
          tagOrUserOrTech: s.equipment,
          severity: "Completed",
        });
      }
    });

    // Sort chronologically
    const sorted = events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Calculate relative offset from the first stop event
    const firstStop = productionStops[0];
    if (firstStop) {
      const stopStartTime = new Date(firstStop.startTime).getTime();
      sorted.forEach((ev) => {
        const evTime = new Date(ev.timestamp).getTime();
        const diffMs = evTime - stopStartTime;
        ev.relativeOffsetMinutes = Math.round(diffMs / 60000);
      });
    }

    return sorted;
  };

  const timelineEvents = getCombinedTimeline();

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(timelineEvents, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "downtime_timeline_sequence.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const triggerPrint = () => {
    window.print();
  };

  const getRelativeBadge = (offset?: number) => {
    if (offset === undefined) return null;
    if (offset === 0) {
      return (
        <span className="px-1.5 py-0.5 rounded-sm bg-rose-600 text-white font-mono text-[9px] font-bold">
          [T-0: STOPPAGE]
        </span>
      );
    }
    if (offset < 0) {
      return (
        <span className="px-1.5 py-0.5 rounded-sm bg-[#1c2026] text-slate-400 border border-industrial font-mono text-[9px]">
          {offset} min
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded-sm bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-mono text-[9px]">
        +{offset} min
      </span>
    );
  };

  const getEventStyles = (type: TimelineEvent["type"], severity?: string) => {
    switch (type) {
      case "PLC":
        if (severity === "CRITICAL") {
          return {
            border: "border-rose-500/20 bg-rose-950/10",
            dot: "bg-rose-500",
            icon: <ShieldAlert className="h-4 w-4 text-rose-400" />,
            label: "PLC CRITICAL",
          };
        }
        if (severity === "WARNING") {
          return {
            border: "border-amber-500/20 bg-amber-950/10",
            dot: "bg-amber-500",
            icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
            label: "PLC WARNING",
          };
        }
        return {
          border: "border-industrial bg-[#12151a]/40",
          dot: "bg-slate-500",
          icon: <Clock className="h-4 w-4 text-slate-400" />,
          label: "PLC INFO",
        };

      case "OPERATOR":
        return {
          border: "border-amber-500/15 bg-amber-500/5",
          dot: "bg-amber-400",
          icon: <User className="h-4 w-4 text-amber-500" />,
          label: "OPERATOR",
        };

      case "MAINTENANCE":
        return {
          border: "border-amber-500/15 bg-amber-500/5",
          dot: "bg-amber-500",
          icon: <Wrench className="h-4 w-4 text-amber-500" />,
          label: "MAINTENANCE",
        };

      case "STOP_START":
        return {
          border: "border-rose-500/40 bg-rose-950/20 animate-pulse",
          dot: "bg-rose-600 ring-2 ring-rose-500/30",
          icon: <ArrowRight className="h-4 w-4 text-rose-400" />,
          label: "STOPPAGE",
        };

      case "STOP_END":
        return {
          border: "border-emerald-500/30 bg-emerald-950/10",
          dot: "bg-emerald-500",
          icon: <ArrowRight className="h-4 w-4 text-emerald-400" />,
          label: "RESTART",
        };
    }
  };

  return (
    <div className="bg-[#16191f] rounded-sm border border-industrial p-5 mt-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-industrial/60">
        <div>
          <h2 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-tight">
            <Clock className="h-4 w-4 text-amber-500" />
            Sequence-of-Events Correlation Timeline
          </h2>
          <p className="text-[11px] text-slate-400">
            Chronologically sorted cross-system correlation of PLC alarms, shift handovers, and technician events with downtime offset.
          </p>
        </div>
        {timelineEvents.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportJSON}
              className="bg-[#1c2026] hover:bg-slate-800 text-slate-200 border border-industrial text-[10px] font-bold font-mono py-1.5 px-3 rounded-sm transition cursor-pointer flex items-center gap-1.5 uppercase"
              title="Download raw JSON timeline"
            >
              <Download className="h-3.5 w-3.5 text-amber-500" />
              Export JSON
            </button>
            <button
              onClick={() => setShowPrintModal(true)}
              className="bg-[#1c2026] hover:bg-slate-800 text-slate-200 border border-industrial text-[10px] font-bold font-mono py-1.5 px-3 rounded-sm transition cursor-pointer flex items-center gap-1.5 uppercase"
              title="Print analytical PDF report"
            >
              <Printer className="h-3.5 w-3.5 text-amber-500" />
              Print PDF Report
            </button>
          </div>
        )}
      </div>

      {timelineEvents.length === 0 ? (
        <div className="bg-[#12151a] p-8 rounded-sm border border-dashed border-industrial text-center text-xs text-slate-500">
          No logs available. Load a scenario or upload custom files to populate the aligned timeline.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest pb-2 border-b border-industrial">
            <span>Engineering Sequence</span>
            <span>Relative Uptime Offset</span>
          </div>

          <div className="space-y-3">
            {timelineEvents.map((ev) => {
              const styles = getEventStyles(ev.type, ev.severity);
              const timeFormatted = new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

              return (
                <div
                  key={ev.id}
                  className={`flex items-start justify-between gap-4 p-3 rounded-sm border ${styles.border} transition hover:bg-[#1c2026]/40`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 bg-[#12151a] p-1.5 rounded-sm border border-industrial">
                      {styles.icon}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400">
                          {styles.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {timeFormatted}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-100">{ev.title}</h4>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{ev.description}</p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {getRelativeBadge(ev.relativeOffsetMinutes)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytical Print PDF Preview Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-[#0c0e12]/95 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex justify-center items-start">
          <div className="bg-white text-slate-900 rounded-sm w-full max-w-4xl p-8 shadow-2xl relative border border-slate-300 print:border-none print:shadow-none my-8 print:my-0">
            {/* Modal Controls - Hidden during real print */}
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-amber-600" />
                <span className="font-bold text-slate-800 uppercase text-xs tracking-wider font-display">Print / Save PDF Report Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerPrint}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs py-2 px-4 rounded-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="h-4 w-4" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs py-2 px-4 rounded-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <X className="h-4 w-4" />
                  Close
                </button>
              </div>
            </div>

            {/* Printable Report Content */}
            <div className="space-y-6 text-slate-900 print:text-black">
              {/* Report Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold font-display uppercase tracking-tight">DOWNTIME ANALYZER REPORT</h1>
                  <p className="text-xs text-slate-500 font-mono mt-1">INDUSTRIAL CORRELATION & CHRONOLOGICAL SEQUENCE</p>
                </div>
                <div className="text-right font-mono text-xs text-slate-600">
                  <p>GENERATE DATE: {new Date().toLocaleDateString()} UTC</p>
                  <p>SYSTEM STATUS: ALIGNED SEQUENCE</p>
                </div>
              </div>

              {/* Statistics Overview Grid */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-sm font-mono text-xs">
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[10px]">TOTAL CHRONO EVENTS</span>
                  <span className="text-base font-bold">{timelineEvents.length} Logs</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[10px]">PLC ALARMS FILTERED</span>
                  <span className="text-base font-bold">{plcAlarms.length} Events</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[10px]">STOPS RECORDED</span>
                  <span className="text-base font-bold">{productionStops.length} Breaks</span>
                </div>
              </div>

              {/* Event Table */}
              <div className="space-y-3">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">Aligned Chronicle Sequence Table</h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-400 font-mono text-[10px] text-slate-600 uppercase">
                      <th className="py-2 w-[15%]">Timestamp</th>
                      <th className="py-2 w-[15%]">System / Class</th>
                      <th className="py-2 w-[20%]">Signal Tag / ID</th>
                      <th className="py-2 w-[40%]">Event Details & Description</th>
                      <th className="py-2 w-[10%] text-right">Offset</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timelineEvents.map((ev) => {
                      const timeStr = new Date(ev.timestamp).toISOString().replace("T", " ").substring(0, 19);
                      return (
                        <tr key={ev.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="py-2 font-mono text-[10px] text-slate-600">{timeStr}</td>
                          <td className="py-2 font-bold text-slate-700">{ev.type}</td>
                          <td className="py-2 font-mono font-semibold text-amber-700">{ev.tagOrUserOrTech}</td>
                          <td className="py-2 text-slate-800">{ev.title} - {ev.description}</td>
                          <td className="py-2 text-right font-mono text-[10px] text-slate-600">
                            {ev.relativeOffsetMinutes !== undefined
                              ? ev.relativeOffsetMinutes === 0
                                ? "T-0"
                                : ev.relativeOffsetMinutes < 0
                                  ? `${ev.relativeOffsetMinutes}m`
                                  : `+${ev.relativeOffsetMinutes}m`
                              : "N/A"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Report Footer */}
              <div className="pt-8 border-t border-slate-200 text-[10px] text-slate-400 font-mono flex justify-between">
                <span>Downtime Analyzer / Factory Insight AI System Report</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
