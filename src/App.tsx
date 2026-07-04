import { useState } from "react";
import { INDUSTRIAL_SCENARIOS, Scenario, PLCAlarm, OperatorLog, MaintenanceEvent, ProductionStop } from "./data/scenarios";
import ScenarioSelector from "./components/ScenarioSelector";
import DashboardCharts from "./components/DashboardCharts";
import PrecursorDetection from "./components/PrecursorDetection";
import TimelineAlignment from "./components/TimelineAlignment";
import DataTables from "./components/DataTables";
import RootCauseReport from "./components/RootCauseReport";
import PricingPlans from "./components/PricingPlans";
import { Activity, ShieldAlert, Cpu, BarChart3, HelpCircle } from "lucide-react";

export default function App() {
  // Initialize with the first scenario (Bottling Line) to provide a rich out-of-the-box experience
  const defaultScenario = INDUSTRIAL_SCENARIOS[0];
  
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(defaultScenario.id);
  const [plcAlarms, setPlcAlarms] = useState<PLCAlarm[]>(defaultScenario.plcAlarms);
  const [operatorLogs, setOperatorLogs] = useState<OperatorLog[]>(defaultScenario.operatorLogs);
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>(defaultScenario.maintenanceEvents);
  const [productionStops, setProductionStops] = useState<ProductionStop[]>(defaultScenario.productionStops);

  // Triggered when a user clicks a preloaded scenario
  const handleSelectScenario = (scenario: Scenario) => {
    setActiveScenarioId(scenario.id);
    setPlcAlarms(scenario.plcAlarms);
    setOperatorLogs(scenario.operatorLogs);
    setMaintenanceEvents(scenario.maintenanceEvents);
    setProductionStops(scenario.productionStops);
  };

  // Triggered when clicking "Reset All Logs"
  const handleReset = () => {
    setActiveScenarioId(null);
    setPlcAlarms([]);
    setOperatorLogs([]);
    setMaintenanceEvents([]);
    setProductionStops([]);
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 flex flex-col font-sans grid-bg">
      {/* Top Banner & Header */}
      <header className="border-b border-industrial bg-[#16191f] sticky top-0 z-50 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-sm flex items-center justify-center font-bold text-black font-display shrink-0 shadow-lg shadow-amber-500/10">
              FI
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-lg font-bold tracking-tight text-white uppercase">Downtime Analyzer</h1>
                <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-sm border border-amber-500/20 font-mono uppercase tracking-widest">
                  Factory Insight AI v1.2
                </span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                Industrial Cross-System Correlation & 5 Whys AI Root Cause Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-[#12151a] border border-industrial px-3 py-1.5 rounded-sm text-emerald-500 uppercase tracking-tighter">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Live System Feed</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Scenario Selection Section */}
        <section id="scenarios-section">
          <ScenarioSelector
            scenarios={INDUSTRIAL_SCENARIOS}
            activeScenarioId={activeScenarioId}
            onSelectScenario={handleSelectScenario}
            onReset={handleReset}
          />
        </section>

        {/* AI Root Cause Analysis Section (High Visibility) */}
        <section id="ai-report-section">
          <RootCauseReport
            plcAlarms={plcAlarms}
            operatorLogs={operatorLogs}
            maintenanceEvents={maintenanceEvents}
            productionStops={productionStops}
          />
        </section>

        {/* Charts & Interactive Stats */}
        <section id="analytics-section">
          <DashboardCharts
            plcAlarms={plcAlarms}
            productionStops={productionStops}
          />
        </section>

        {/* Real-time Precursor Alarm Signature Scanner */}
        <section id="precursor-section">
          <PrecursorDetection
            plcAlarms={plcAlarms}
            productionStops={productionStops}
          />
        </section>

        {/* Sequence-of-Events Aligned Chronological Timeline */}
        <section id="timeline-section">
          <TimelineAlignment
            plcAlarms={plcAlarms}
            operatorLogs={operatorLogs}
            maintenanceEvents={maintenanceEvents}
            productionStops={productionStops}
          />
        </section>

        {/* Tabbed Live Diagnostics Tables & Upload Ingestion Engine */}
        <section id="data-hub-section">
          <DataTables
            plcAlarms={plcAlarms}
            setPlcAlarms={setPlcAlarms}
            operatorLogs={operatorLogs}
            setOperatorLogs={setOperatorLogs}
            maintenanceEvents={maintenanceEvents}
            setMaintenanceEvents={setMaintenanceEvents}
            productionStops={productionStops}
            setProductionStops={setProductionStops}
          />
        </section>

        {/* Collapsible Roadmap, Core Advantages & Pricing */}
        <section id="pricing-section">
          <PricingPlans />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-industrial bg-[#16191f] px-4 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            &copy; 2026 Factory Insight AI. All industrial registers protected.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-amber-500 transition cursor-pointer">OPC UA Connect</span>
            <span>•</span>
            <span className="hover:text-amber-500 transition cursor-pointer">Ignition Bridge</span>
            <span>•</span>
            <span className="hover:text-amber-500 transition cursor-pointer">Siemens S7 Link</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
