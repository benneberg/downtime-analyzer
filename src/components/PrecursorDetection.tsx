import React from "react";
import { PLCAlarm, ProductionStop } from "../data/scenarios";
import { Clock, ShieldAlert, CheckCircle, Info } from "lucide-react";
import { motion } from "motion/react";

interface PrecursorDetectionProps {
  plcAlarms: PLCAlarm[];
  productionStops: ProductionStop[];
}

export default function PrecursorDetection({ plcAlarms, productionStops }: PrecursorDetectionProps) {
  // Calculate precursors based on current live data
  const analyzePrecursors = () => {
    const results = {
      within2m: [] as { alarm: PLCAlarm; diffSeconds: number }[],
      within5m: [] as { alarm: PLCAlarm; diffSeconds: number }[],
      within10m: [] as { alarm: PLCAlarm; diffSeconds: number }[],
    };

    if (productionStops.length === 0) return results;

    // Use the first stop or all stops for correlation
    const stop = productionStops[0];
    const stopTime = new Date(stop.startTime).getTime();

    plcAlarms.forEach((alarm) => {
      const alarmTime = new Date(alarm.timestamp).getTime();
      const diffMs = stopTime - alarmTime;
      const diffSeconds = diffMs / 1000;

      // Alarm must happen BEFORE the stop (positive difference)
      if (diffSeconds > 0) {
        if (diffSeconds <= 120) {
          results.within2m.push({ alarm, diffSeconds });
        }
        if (diffSeconds <= 300) {
          results.within5m.push({ alarm, diffSeconds });
        }
        if (diffSeconds <= 600) {
          results.within10m.push({ alarm, diffSeconds });
        }
      }
    });

    return results;
  };

  const { within2m, within5m, within10m } = analyzePrecursors();

  // Sort alarm lists by closeness to stoppage
  const sortCloseness = (list: { alarm: PLCAlarm; diffSeconds: number }[]) => {
    return [...list].sort((a, b) => a.diffSeconds - b.diffSeconds);
  };

  const formatted2m = sortCloseness(within2m);
  const formatted5m = sortCloseness(within5m);
  const formatted10m = sortCloseness(within10m);

  return (
    <div className="bg-[#16191f] rounded-sm border border-industrial p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-tight">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            Statistical Precursor Detection
          </h2>
          <p className="text-[11px] text-slate-400">
            Scanning PLC alarms that consistently triggered in the critical minutes immediately prior to downtime.
          </p>
        </div>
      </div>

      {productionStops.length === 0 ? (
        <div className="bg-[#12151a]/40 p-4 rounded-sm border border-dashed border-industrial text-center text-xs text-slate-500 uppercase tracking-wider">
          No production stops configured. Please define a production stop to calculate precursors.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#12151a] rounded-sm p-3 border border-industrial flex items-start gap-2.5">
            <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-300">
              Correlating PLC triggers before Stop at{" "}
              <strong className="font-mono text-slate-100">
                {new Date(productionStops[0].startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </strong>{" "}
              on machine <span className="font-bold text-amber-500 uppercase tracking-widest">{productionStops[0].equipment}</span>.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 2 Minutes Precursors */}
            <div className="bg-[#12151a] p-3 rounded-sm border border-industrial">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-industrial">
                <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="h-3.5 w-3.5" />
                  &lt; 2 Minutes Prior
                </span>
                <span className="text-[9px] font-mono bg-rose-500/10 text-rose-300 px-1.5 py-0.5 rounded-sm">
                  {formatted2m.length} ALARMS
                </span>
              </div>
              {formatted2m.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-2">No alarms detected in this window.</p>
              ) : (
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {formatted2m.map(({ alarm, diffSeconds }, idx) => (
                    <div key={idx} className="bg-[#1c2026] p-2 rounded-sm border border-rose-500/10">
                      <div className="flex justify-between items-start text-[10px] font-mono">
                        <span className="text-rose-300 font-bold">{alarm.tag}</span>
                        <span className="text-slate-500 text-[9px]">
                          -{Math.floor(diffSeconds)}s
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-1">{alarm.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5 Minutes Precursors */}
            <div className="bg-[#12151a] p-3 rounded-sm border border-industrial">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-industrial">
                <span className="text-xs font-semibold text-amber-500 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="h-3.5 w-3.5" />
                  &lt; 5 Minutes Prior
                </span>
                <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-sm">
                  {formatted5m.length} ALARMS
                </span>
              </div>
              {formatted5m.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-2">No alarms detected in this window.</p>
              ) : (
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {formatted5m.map(({ alarm, diffSeconds }, idx) => (
                    <div key={idx} className="bg-[#1c2026] p-2 rounded-sm border border-amber-500/10">
                      <div className="flex justify-between items-start text-[10px] font-mono">
                        <span className="text-amber-500 font-bold">{alarm.tag}</span>
                        <span className="text-slate-500 text-[9px]">
                          -{Math.floor(diffSeconds / 60)}m {Math.floor(diffSeconds % 60)}s
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-1">{alarm.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 10 Minutes Precursors */}
            <div className="bg-[#12151a] p-3 rounded-sm border border-industrial">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-industrial">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  &lt; 10 Minutes Prior
                </span>
                <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-sm">
                  {formatted10m.length} ALARMS
                </span>
              </div>
              {formatted10m.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-2">No alarms detected in this window.</p>
              ) : (
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {formatted10m.map(({ alarm, diffSeconds }, idx) => (
                    <div key={idx} className="bg-[#1c2026] p-2 rounded-sm border border-industrial">
                      <div className="flex justify-between items-start text-[10px] font-mono">
                        <span className="text-slate-300 font-bold">{alarm.tag}</span>
                        <span className="text-slate-500 text-[9px]">
                          -{Math.floor(diffSeconds / 60)}m {Math.floor(diffSeconds % 60)}s
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-1">{alarm.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
