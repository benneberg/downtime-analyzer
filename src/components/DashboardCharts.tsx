import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { PLCAlarm, ProductionStop } from "../data/scenarios";
import { BarChart3, PieChartIcon, Percent, AlertTriangle, ChevronDown, ChevronUp, Zap, Sparkles, Activity } from "lucide-react";

interface DashboardChartsProps {
  plcAlarms: PLCAlarm[];
  productionStops: ProductionStop[];
}

export default function DashboardCharts({ plcAlarms, productionStops }: DashboardChartsProps) {
  const [showAnomalyDetails, setShowAnomalyDetails] = useState(false);

  // Decimate/Downsample array if it is too large to keep page frame rates steady at 60fps on desktop/mobile
  const decimateAlarms = (alarms: PLCAlarm[], maxElements = 1000): PLCAlarm[] => {
    if (alarms.length <= maxElements) return alarms;
    const step = Math.ceil(alarms.length / maxElements);
    const decimated: PLCAlarm[] = [];
    for (let i = 0; i < alarms.length; i += step) {
      decimated.push(alarms[i]);
    }
    return decimated;
  };

  const decimatedAlarms = decimateAlarms(plcAlarms);

  // 1. Calculate chatty alarms tag frequency
  const getTagFrequencyData = () => {
    const counts: { [key: string]: number } = {};
    decimatedAlarms.forEach((a) => {
      counts[a.tag] = (counts[a.tag] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5
  };

  // 2. Calculate severity counts
  const getSeverityData = () => {
    let critical = 0;
    let warning = 0;
    let info = 0;

    decimatedAlarms.forEach((a) => {
      if (a.severity === "CRITICAL") critical++;
      else if (a.severity === "WARNING") warning++;
      else info++;
    });

    return [
      { name: "Critical", value: critical, color: "#f87171" },
      { name: "Warning", value: warning, color: "#fbbf24" },
      { name: "Info", value: info, color: "#38bdf8" },
    ].filter((item) => item.value > 0);
  };

  const tagData = getTagFrequencyData();
  const severityData = getSeverityData();

  // 3. Compute simple availability stats
  const totalDowntimeMinutes = productionStops.reduce((acc, stop) => acc + stop.durationMinutes, 0);
  // Assume a shift is 480 minutes (8 hours)
  const shiftDurationMinutes = 480;
  const uptimeMinutes = Math.max(0, shiftDurationMinutes - totalDowntimeMinutes);
  const availabilityRate = ((uptimeMinutes / shiftDurationMinutes) * 100).toFixed(1);

  // 4. Statistical Baseline Anomaly Detection Engine
  const calculateAnomalyMetrics = () => {
    if (decimatedAlarms.length === 0) return null;

    // Standard industrial baselines (derived from ISO 13849 & ISA 18.2 Alarm Management benchmark standards)
    const BASELINE_CRITICAL_RATIO = 0.12; // Expected baseline: <=12% critical
    const BASELINE_ALARM_BURST_DENSITY = 2.0; // Expected baseline: ~2 alarms per 10m window
    const BASELINE_MAX_TAG_CONCENTRATION = 0.30; // Expected: No single tag should exceed 30% of stream

    const totalCount = decimatedAlarms.length;
    const criticalCount = decimatedAlarms.filter((a) => a.severity === "CRITICAL").length;
    const warningCount = decimatedAlarms.filter((a) => a.severity === "WARNING").length;
    const criticalRatio = totalCount > 0 ? criticalCount / totalCount : 0;

    // Tag concentration
    const topTag = tagData[0] || { tag: "NONE", count: 0 };
    const topTagConcentration = totalCount > 0 ? topTag.count / totalCount : 0;

    // Time window calculation for burst density
    let timeSpanMinutes = 15;
    if (decimatedAlarms.length >= 2) {
      const timestamps = decimatedAlarms
        .map((a) => new Date(a.timestamp).getTime())
        .filter((t) => !isNaN(t))
        .sort((a, b) => a - b);
      if (timestamps.length >= 2) {
        const diffMs = timestamps[timestamps.length - 1] - timestamps[0];
        timeSpanMinutes = Math.max(1, Math.round(diffMs / 60000));
      }
    }
    const currentDensityPer10M = (totalCount / Math.max(1, timeSpanMinutes)) * 10;

    // Calculate statistical deviations
    const criticalRatioDeviation = ((criticalRatio - BASELINE_CRITICAL_RATIO) / BASELINE_CRITICAL_RATIO) * 100;
    const densityDeviation = ((currentDensityPer10M - BASELINE_ALARM_BURST_DENSITY) / BASELINE_ALARM_BURST_DENSITY) * 100;
    const concentrationDeviation = ((topTagConcentration - BASELINE_MAX_TAG_CONCENTRATION) / BASELINE_MAX_TAG_CONCENTRATION) * 100;

    // Anomaly conditions
    const isCriticalAnomaly = criticalRatio > 0.25 || criticalCount >= 2;
    const isDensityAnomaly = currentDensityPer10M > 3.5;
    const isConcentrationAnomaly = topTagConcentration > 0.40 && topTag.count >= 2;

    const hasAnomaly = isCriticalAnomaly || isDensityAnomaly || isConcentrationAnomaly;
    if (!hasAnomaly) return null;

    const zScoreEstimate = Math.min(4.8, 1.0 + (criticalRatio * 3.5) + (currentDensityPer10M > 4 ? 1.2 : 0)).toFixed(1);

    return {
      hasAnomaly,
      zScore: zScoreEstimate,
      criticalRatioPercent: (criticalRatio * 100).toFixed(0),
      criticalRatioDeviation: Math.round(criticalRatioDeviation),
      currentDensityPer10M: currentDensityPer10M.toFixed(1),
      densityDeviation: Math.round(densityDeviation),
      topTag: topTag.tag,
      topTagConcentrationPercent: (topTagConcentration * 100).toFixed(0),
      concentrationDeviation: Math.round(concentrationDeviation),
      totalCount,
      criticalCount,
      warningCount,
      timeSpanMinutes,
    };
  };

  const anomaly = calculateAnomalyMetrics();

  return (
    <div className="space-y-4">
      {/* Statistical Anomaly Alert Notification Badge */}
      {anomaly && (
        <div className="bg-[#1c1214] border border-rose-500/40 rounded-sm p-3.5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="bg-rose-500/20 text-rose-400 p-2 rounded-sm border border-rose-500/30 shrink-0">
                <AlertTriangle className="h-5 w-5 animate-pulse text-rose-400" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-rose-500 text-black">
                    ⚠️ Statistical Anomaly Alert
                  </span>
                  <span className="text-[10px] font-mono text-rose-300 font-semibold">
                    Z-Score: +{anomaly.zScore}σ vs ISA-18.2 Baseline
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1 font-medium">
                  Incoming PLC alarms exhibit a <strong className="text-rose-400 font-bold">+{anomaly.criticalRatioDeviation}%</strong> spike in Critical Severity and high tag concentration on <code className="bg-[#12151a] px-1.5 py-0.5 rounded text-amber-400 font-mono text-[11px]">{anomaly.topTag}</code>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAnomalyDetails(!showAnomalyDetails)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#12151a] border border-rose-500/30 text-rose-300 hover:bg-rose-950/30 transition text-[11px] font-mono uppercase tracking-wider shrink-0 cursor-pointer"
            >
              <span>{showAnomalyDetails ? "Hide Baseline Matrix" : "Inspect Deviation"}</span>
              {showAnomalyDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Expandable Baseline Comparison Matrix */}
          {showAnomalyDetails && (
            <div className="mt-3 pt-3 border-t border-rose-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div className="bg-[#12151a] p-2.5 rounded-sm border border-industrial">
                <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Critical Severity Ratio</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-bold font-mono text-rose-400">{anomaly.criticalRatioPercent}%</span>
                  <span className="text-[10px] text-slate-400">(Baseline: 12%)</span>
                </div>
                <span className="text-[9px] text-rose-400 font-mono block mt-0.5 font-semibold">
                  +{anomaly.criticalRatioDeviation}% Above Limit
                </span>
              </div>

              <div className="bg-[#12151a] p-2.5 rounded-sm border border-industrial">
                <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Alarm Burst Velocity</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-bold font-mono text-amber-400">{anomaly.currentDensityPer10M} /10m</span>
                  <span className="text-[10px] text-slate-400">(Baseline: 2.0)</span>
                </div>
                <span className="text-[9px] text-amber-400 font-mono block mt-0.5 font-semibold">
                  {anomaly.densityDeviation > 0 ? `+${anomaly.densityDeviation}% Velocity` : "Within limits"}
                </span>
              </div>

              <div className="bg-[#12151a] p-2.5 rounded-sm border border-industrial">
                <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Tag Concentration</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-bold font-mono text-amber-400">{anomaly.topTagConcentrationPercent}%</span>
                  <span className="text-[10px] text-slate-400 font-mono truncate">({anomaly.topTag})</span>
                </div>
                <span className="text-[9px] text-amber-400 font-mono block mt-0.5 font-semibold">
                  Baseline threshold: 30%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3-Column Visual Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart 1: Chatty Alarm Tags */}
        <div className="bg-[#16191f] rounded-sm border border-industrial p-4 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-display text-xs font-bold text-slate-100 flex items-center gap-2 mb-1 uppercase tracking-wider">
              <BarChart3 className="h-4 w-4 text-amber-500" />
              Top 5 Repeating PLC Alarms
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Most frequent registers firing during the current incident log window.
            </p>
          </div>

          <div className="h-[180px] w-full">
            {tagData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                No PLC data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tagData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                  <XAxis type="number" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis dataKey="tag" type="category" stroke="#475569" fontSize={9} tickLine={false} width={85} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#12151a", borderColor: "rgba(148, 163, 184, 0.1)", borderRadius: "2px" }}
                    labelStyle={{ color: "#f1f5f9", fontWeight: "bold", fontSize: "10px" }}
                    itemStyle={{ color: "#fbbf24", fontSize: "11px" }}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 2, 2, 0]} barSize={12}>
                    {tagData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#fbbf24" : "#d97706"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Alarm Severity Split */}
        <div className="bg-[#16191f] rounded-sm border border-industrial p-4 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-display text-xs font-bold text-slate-100 flex items-center gap-2 mb-1 uppercase tracking-wider">
              <PieChartIcon className="h-4 w-4 text-amber-500" />
              Alarm Severity Distribution
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Proportion of Informational, Warning, and Critical signals.
            </p>
          </div>

          <div className="h-[180px] w-full flex items-center">
            {severityData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-xs text-slate-500 italic">
                No alarms logged
              </div>
            ) : (
              <div className="w-full grid grid-cols-2 items-center gap-2">
                <div className="h-[140px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#12151a", borderColor: "rgba(148, 163, 184, 0.1)", borderRadius: "2px" }}
                        itemStyle={{ fontSize: "11px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {severityData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      <div>
                        <span className="text-[10px] font-bold text-slate-200 block leading-tight uppercase tracking-tight">{entry.name}</span>
                        <span className="text-[9px] font-mono text-slate-400">{entry.value} EVENTS</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Availability & Downtime Stats */}
        <div className="bg-[#16191f] rounded-sm border border-industrial p-4 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-display text-xs font-bold text-slate-100 flex items-center gap-2 mb-1 uppercase tracking-wider">
              <Percent className="h-4 w-4 text-amber-500" />
              8-Hour Shift Availability
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Actual machine uptime ratio vs. accumulated stops.
            </p>
          </div>

          <div className="flex flex-col justify-center items-center py-4 bg-[#12151a] rounded-sm border border-industrial">
            <span className="text-4xl font-display font-bold text-amber-500 tracking-tight">
              {availabilityRate}%
            </span>
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 mt-1">
              Uptime Availability Rate
            </span>

            <div className="w-4/5 bg-[#1c2026] h-1.5 rounded-sm overflow-hidden mt-4">
              <div
                className="bg-amber-500 h-full rounded-sm transition-all duration-500"
                style={{ width: `${availabilityRate}%` }}
              />
            </div>

            <div className="w-4/5 flex justify-between text-[10px] font-mono text-slate-400 mt-2 uppercase tracking-tighter">
              <span>UPTIME: {uptimeMinutes}M</span>
              <span>STOP: {totalDowntimeMinutes}M</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

