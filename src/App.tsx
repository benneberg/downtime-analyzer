import { useState, useEffect } from "react";
import { INDUSTRIAL_SCENARIOS, Scenario, PLCAlarm, OperatorLog, MaintenanceEvent, ProductionStop } from "./data/scenarios";
import ScenarioSelector from "./components/ScenarioSelector";
import DashboardCharts from "./components/DashboardCharts";
import PrecursorDetection from "./components/PrecursorDetection";
import TimelineAlignment from "./components/TimelineAlignment";
import DataTables from "./components/DataTables";
import RootCauseReport from "./components/RootCauseReport";
import PricingPlans from "./components/PricingPlans";
import ConnectedFactory from "./components/ConnectedFactory";
import PlcCodeReview from "./components/PlcCodeReview";
import { 
  Activity, 
  ShieldAlert, 
  Cpu, 
  BarChart3, 
  HelpCircle, 
  AlertCircle, 
  KeyRound, 
  X,
  Code2,
  Radio,
  Layers,
  ShieldCheck,
  UserCheck
} from "lucide-react";

export default function App() {
  // Navigation Module
  const [activeModule, setActiveModule] = useState<"downtime" | "plc_review" | "connected_factory">("downtime");

  // User Role (RBAC)
  const [userRole, setUserRole] = useState<"ADMIN" | "ANALYST" | "VIEWER">("ADMIN");

  // Initialize with the first scenario (Bottling Line) to provide a rich out-of-the-box experience
  const defaultScenario = INDUSTRIAL_SCENARIOS[0];
  
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(defaultScenario.id);
  const [plcAlarms, setPlcAlarms] = useState<PLCAlarm[]>(defaultScenario.plcAlarms);
  const [operatorLogs, setOperatorLogs] = useState<OperatorLog[]>(defaultScenario.operatorLogs);
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>(defaultScenario.maintenanceEvents);
  const [productionStops, setProductionStops] = useState<ProductionStop[]>(defaultScenario.productionStops);

  // API key configuration guard state
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean | null>(null);
  const [showKeyWarning, setShowKeyWarning] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/key-status")
      .then((res) => res.json())
      .then((data) => {
        setApiKeyConfigured(data.configured);
        if (data.configured === false) {
          setShowKeyWarning(true);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch key status:", err);
        setApiKeyConfigured(false);
        setShowKeyWarning(true);
      });
  }, []);

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

  // Ingest live alarm from Connected Factory OPC UA / MQTT
  const handleIngestLiveAlarm = (alarm: PLCAlarm) => {
    setPlcAlarms((prev) => [alarm, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 flex flex-col font-sans grid-bg">
      {/* Top Banner & Header */}
      <header className="border-b border-industrial bg-[#16191f] sticky top-0 z-50 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-sm flex items-center justify-center font-bold text-black font-display shrink-0 shadow-lg shadow-amber-500/10">
              FI
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-base sm:text-lg font-bold tracking-tight text-white uppercase">
                  Factory Insight AI
                </h1>
                <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-sm border border-amber-500/20 font-mono uppercase tracking-widest">
                  Industrial Suite v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 hidden sm:block">
                SCADA Integration • PLC Code Review • Downtime 5-Whys AI
              </p>
            </div>
          </div>

          {/* Module Switcher & Role Badge */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1 bg-[#12151a] p-1 rounded-sm border border-industrial">
              <button
                onClick={() => setActiveModule("downtime")}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  activeModule === "downtime"
                    ? "bg-amber-500 text-black font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Downtime Analyzer
              </button>

              <button
                onClick={() => setActiveModule("plc_review")}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  activeModule === "plc_review"
                    ? "bg-amber-500 text-black font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                PLC Code Review
              </button>

              <button
                onClick={() => setActiveModule("connected_factory")}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  activeModule === "connected_factory"
                    ? "bg-amber-500 text-black font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Radio className="h-3.5 w-3.5" />
                SCADA / Live Bridge
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-mono bg-[#12151a] border border-industrial px-2.5 py-1 rounded-sm text-amber-400 uppercase">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                <span>{userRole}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {showKeyWarning && (
          <div className="bg-[#1c1417] border border-rose-500/30 rounded-sm p-4 text-xs text-rose-300 relative overflow-hidden shadow-md">
            <div className="absolute right-2 top-2">
              <button 
                onClick={() => setShowKeyWarning(false)}
                className="text-slate-500 hover:text-slate-300 p-1 rounded-sm hover:bg-slate-800/40 transition cursor-pointer"
                title="Dismiss warning"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-start gap-3 pr-6">
              <div className="bg-rose-500/10 p-2 rounded-sm border border-rose-500/20 text-rose-400 shrink-0">
                <KeyRound className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-rose-200 uppercase tracking-wider flex items-center gap-1.5">
                  Gemini API Key for Real-Time AI Generation
                </h4>
                <p className="mt-1 leading-relaxed text-[11px] text-slate-300">
                  The <strong className="text-amber-500 font-mono">GEMINI_API_KEY</strong> secret can be configured under Settings &gt; Secrets in AI Studio. The system includes full offline heuristic evaluation and interactive simulated telemetry when operating offline.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 1: DOWNTIME ANALYZER SUITE --- */}
        {activeModule === "downtime" && (
          <div className="space-y-6">
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
          </div>
        )}

        {/* --- VIEW 2: PLC CODE REVIEW MODULE (PROJECT 1) --- */}
        {activeModule === "plc_review" && (
          <section id="plc-review-module-section">
            <PlcCodeReview />
          </section>
        )}

        {/* --- VIEW 3: CONNECTED FACTORY (PHASE 3: SCADA / LIVE INGESTION) --- */}
        {activeModule === "connected_factory" && (
          <section id="connected-factory-module-section">
            <ConnectedFactory
              onIngestLiveAlarm={handleIngestLiveAlarm}
              userRole={userRole}
              setUserRole={setUserRole}
            />
          </section>
        )}

        {/* Collapsible Roadmap, Core Advantages & Pricing */}
        <section id="pricing-section">
          <PricingPlans />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-industrial bg-[#16191f] px-4 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            &copy; 2026 Factory Insight AI. Certified IEC 61131-3 & ISA-18.2 Compliant.
          </div>
          <div className="flex gap-4">
            <span 
              onClick={() => setActiveModule("connected_factory")}
              className="hover:text-amber-500 transition cursor-pointer"
            >
              OPC UA Connect
            </span>
            <span>•</span>
            <span 
              onClick={() => setActiveModule("connected_factory")}
              className="hover:text-amber-500 transition cursor-pointer"
            >
              MQTT Sparkplug B
            </span>
            <span>•</span>
            <span 
              onClick={() => setActiveModule("plc_review")}
              className="hover:text-amber-500 transition cursor-pointer"
            >
              PLC Code Auditor
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

