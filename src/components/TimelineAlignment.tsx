import { PLCAlarm, OperatorLog, MaintenanceEvent, ProductionStop } from "../data/scenarios";
import { Clock, ShieldAlert, User, Wrench, AlertTriangle, ArrowRight } from "lucide-react";

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
      <div className="mb-6">
        <h2 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-tight">
          <Clock className="h-4 w-4 text-amber-500" />
          Sequence-of-Events Correlation Timeline
        </h2>
        <p className="text-[11px] text-slate-400">
          Chronologically sorted cross-system correlation of PLC alarms, shift handovers, and technician events with downtime offset.
        </p>
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
    </div>
  );
}
