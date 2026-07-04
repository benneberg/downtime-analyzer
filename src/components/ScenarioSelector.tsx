import { Scenario } from "../data/scenarios";
import { AlertTriangle, Activity, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  onSelectScenario: (scenario: Scenario) => void;
  onReset: () => void;
}

export default function ScenarioSelector({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onReset
}: ScenarioSelectorProps) {
  return (
    <div className="bg-[#16191f] rounded-sm border border-industrial p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-tight">
            <Activity className="h-4 w-4 text-amber-500" />
            Active Industrial Scenarios
          </h2>
          <p className="text-[11px] text-slate-400">
            Select a pre-populated industrial failure incident to test cross-system alignment and AI correlation.
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-sm text-xs font-semibold transition shrink-0 border border-industrial uppercase tracking-wider"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset All Logs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario) => {
          const isActive = scenario.id === activeScenarioId;

          return (
            <motion.div
              key={scenario.id}
              whileHover={{ scale: 1.005, y: -1 }}
              onClick={() => onSelectScenario(scenario)}
              className={`cursor-pointer rounded-sm p-4 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? "bg-[#1c2026] border-amber-500 shadow-lg shadow-amber-500/5"
                  : "bg-[#12151a] border-industrial hover:bg-[#1c2026]"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-amber-600" />
              )}
              
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[9px] font-mono uppercase bg-[#1c2026] px-2 py-0.5 rounded-sm text-amber-500 border border-industrial">
                    {scenario.equipment}
                  </span>
                  <AlertTriangle className={`h-3.5 w-3.5 ${isActive ? "text-amber-500" : "text-slate-600"}`} />
                </div>
                <h3 className="font-display text-xs font-bold text-slate-200 uppercase tracking-tight">{scenario.name}</h3>
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-3">
                  {scenario.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-industrial flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-mono">
                  {scenario.plcAlarms.length} ALARMS • {scenario.operatorLogs.length} LOGS
                </span>
                <span className={`font-bold uppercase tracking-widest text-[9px] ${isActive ? "text-amber-500" : "text-slate-500"}`}>
                  {isActive ? "SELECTED" : "CLICK TO LOAD"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
