import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { PLCAlarm, ProductionStop } from "../data/scenarios";
import { BarChart3, PieChartIcon, Percent } from "lucide-react";

interface DashboardChartsProps {
  plcAlarms: PLCAlarm[];
  productionStops: ProductionStop[];
}

export default function DashboardCharts({ plcAlarms, productionStops }: DashboardChartsProps) {
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

  return (
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
  );
}
