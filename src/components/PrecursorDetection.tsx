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

  // Shift-Change Fatigue Prediction Calculations
  const calculateShiftFatigue = () => {
    if (productionStops.length === 0) return null;
    const stop = productionStops[0];
    const stopDate = new Date(stop.startTime);
    
    // Get UTC hours and minutes
    const hours = stopDate.getUTCHours();
    const minutes = stopDate.getUTCMinutes();
    const totalMinutesOfDay = hours * 60 + minutes;

    // Shift changes occur at:
    // Morning shift change: 06:00 (360 mins)
    // Afternoon shift change: 14:00 (840 mins)
    // Night shift change: 22:00 (1320 mins)
    const shiftChanges = [
      { name: "Night-to-Morning Shift Transition", timeMins: 360, label: "06:00 UTC" },
      { name: "Morning-to-Afternoon Shift Transition", timeMins: 840, label: "14:00 UTC" },
      { name: "Afternoon-to-Night Shift Transition", timeMins: 1320, label: "22:00 UTC" }
    ];

    let minDiff = 1440; // max minutes in a day
    let closestTransition = shiftChanges[0];

    shiftChanges.forEach((sc) => {
      // Calculate absolute difference considering day wrap-around
      let diff = Math.abs(totalMinutesOfDay - sc.timeMins);
      if (diff > 720) {
        diff = 1440 - diff;
      }
      if (diff < minDiff) {
        minDiff = diff;
        closestTransition = sc;
      }
    });

    // Determine fatigue vulnerability threat rating
    let riskLevel: "CRITICAL" | "WARNING" | "SAFE" = "SAFE";
    let riskLabel = "Stable Operations - Low Fatigue Proximity";
    let riskColor = "text-emerald-400 border-emerald-500/20 bg-emerald-950/10";
    let riskIndicator = "bg-emerald-500";
    let riskPercent = 15;

    if (minDiff <= 30) {
      riskLevel = "CRITICAL";
      riskLabel = "High Handover Vulnerability - Transition Window Active";
      riskColor = "text-rose-400 border-rose-500/30 bg-rose-950/20";
      riskIndicator = "bg-rose-500";
      riskPercent = 95;
    } else if (minDiff <= 60) {
      riskLevel = "WARNING";
      riskLabel = "Moderate Proximity - Shift Overlap Buffer Active";
      riskColor = "text-amber-400 border-amber-500/20 bg-amber-950/5";
      riskIndicator = "bg-amber-500";
      riskPercent = 65;
    }

    return {
      hours,
      minutes,
      minDiff,
      closestTransition,
      riskLevel,
      riskLabel,
      riskColor,
      riskIndicator,
      riskPercent,
    };
  };

  const fatigueResult = calculateShiftFatigue();

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
        <div className="space-y-6">
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

          {/* Shift-Change Transition Fatigue Predictor Panel */}
          {fatigueResult && (
            <div className="border-t border-industrial/60 pt-5 mt-4 space-y-4">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-tight">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Shift-Change Transition Fatigue Predictor
                </h3>
                <p className="text-[11px] text-slate-400">
                  Correlating downtime occurrences with factory operator rotational transition buffers to identify coordination exhaustion patterns.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-[#12151a] p-4 rounded-sm border border-industrial">
                {/* Visual Risk Gauge Dial */}
                <div className="bg-[#1c2026] p-4 rounded-sm border border-industrial/80 flex flex-col items-center justify-center text-center space-y-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Fatigue Vulnerability Index</span>
                  
                  {/* Custom Gauge Progress bar */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* SVG Progress Ring */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="46" strokeWidth="6" stroke="#12151a" fill="transparent" />
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        strokeWidth="6"
                        stroke={fatigueResult.riskLevel === "CRITICAL" ? "#ef4444" : fatigueResult.riskLevel === "WARNING" ? "#f59e0b" : "#10b981"}
                        strokeDasharray={289}
                        strokeDashoffset={289 - (289 * fatigueResult.riskPercent) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-mono font-bold text-white">{fatigueResult.riskPercent}%</span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase">Threat Level</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm border uppercase ${fatigueResult.riskColor}`}>
                    {fatigueResult.riskLevel} RISK
                  </span>
                </div>

                {/* Analytical Explanation */}
                <div className="lg:col-span-2 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Proximity Context Analysis</span>
                    <p className="text-xs text-slate-200">
                      The current production stop started at{" "}
                      <strong className="font-mono text-white">
                        {String(fatigueResult.hours).padStart(2, "0")}:{String(fatigueResult.minutes).padStart(2, "0")} UTC
                      </strong>
                      , which is exactly{" "}
                      <span className="text-amber-500 font-bold font-mono">{fatigueResult.minDiff} minutes</span> away from the closest{" "}
                      <span className="text-white font-semibold">{fatigueResult.closestTransition.name} ({fatigueResult.closestTransition.label})</span>.
                    </p>
                    <div className="text-[11px] text-slate-400 leading-relaxed bg-[#1c2026] p-2.5 rounded-sm border border-industrial/50">
                      <strong className="text-slate-200">Physiological Factor:</strong> Handover transition intervals represent a critical window for cognitive strain. Operators coming off an 8-hour shift suffer reduced reaction fidelity, while incoming teams inherit machine registers lacking comprehensive verbal orientation, compounding response lag.
                    </div>
                  </div>

                  {/* Recommendations Actions */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Reliability Hardening Checklist</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <CheckCircle className="h-3 w-3 text-amber-500 shrink-0" />
                        <span>Enforce 15m shift overlaps</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <CheckCircle className="h-3 w-3 text-amber-500 shrink-0" />
                        <span>Digital pre-over checklist</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <CheckCircle className="h-3 w-3 text-amber-500 shrink-0" />
                        <span>Log state snapshots automatically</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <CheckCircle className="h-3 w-3 text-amber-500 shrink-0" />
                        <span>Schedule high-risk audits post-transition</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
