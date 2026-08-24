import { useState, useEffect, useRef } from "react";
import { 
  Radio, 
  Wifi, 
  RefreshCw, 
  Play, 
  Pause, 
  Plus, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Server, 
  Cpu, 
  Activity, 
  Send,
  Zap,
  Terminal,
  ExternalLink,
  ChevronRight,
  Database
} from "lucide-react";
import { PLCAlarm } from "../data/scenarios";

interface ConnectedFactoryProps {
  onIngestLiveAlarm: (alarm: PLCAlarm) => void;
  userRole: "ADMIN" | "ANALYST" | "VIEWER";
  setUserRole: (role: "ADMIN" | "ANALYST" | "VIEWER") => void;
}

interface OPCUANode {
  id: string;
  displayName: string;
  dataType: string;
  unit: string;
  accessLevel: string;
  currentValue: string;
  quality: string;
  category: string;
}

interface MQTTMessage {
  id: string;
  topic: string;
  timestamp: string;
  metrics: { name: string; value: string | number | boolean; type: string }[];
  rawPayload: string;
}

export default function ConnectedFactory({
  onIngestLiveAlarm,
  userRole,
  setUserRole,
}: ConnectedFactoryProps) {
  const [activeTab, setActiveTab] = useState<"opcua" | "mqtt" | "rbac">("opcua");

  // --- OPC UA State ---
  const [opcNodes, setOpcNodes] = useState<OPCUANode[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([
    "ns=2;s=PlantA.Line1.Motor.Current",
    "ns=2;s=PlantA.Line1.Motor.VibrationZ",
    "ns=2;s=PlantA.Line1.Sensors.PhotoEye402",
  ]);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<number>(3000);
  const [lastPolledAt, setLastPolledAt] = useState<string | null>(null);
  const [pollLog, setPollLog] = useState<string[]>([]);
  const [isConnectingOpc, setIsConnectingOpc] = useState(false);
  const [opcConnected, setOpcConnected] = useState(true);

  // --- MQTT Sparkplug B State ---
  const [mqttConnected, setMqttConnected] = useState(true);
  const [subscribedTopic, setSubscribedTopic] = useState("spBv1.0/PlantA/DDATA/Cell1/Sensors");
  const [mqttMessages, setMqttMessages] = useState<MQTTMessage[]>([]);
  const [isSimulatingMqtt, setIsSimulatingMqtt] = useState(true);

  // Initial Fetch of OPC UA Nodes
  useEffect(() => {
    fetchOpcNodes();
  }, []);

  const fetchOpcNodes = async () => {
    try {
      setIsConnectingOpc(true);
      const res = await fetch("/api/opcua/nodes");
      if (res.ok) {
        const data = await res.json();
        setOpcNodes(data.nodes || []);
        setOpcConnected(true);
      }
    } catch (e) {
      console.error("Failed to fetch OPC nodes", e);
    } finally {
      setIsConnectingOpc(false);
    }
  };

  // Poll OPC UA server registers
  const handlePollOpc = async () => {
    try {
      const res = await fetch("/api/opcua/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeIds: selectedNodes }),
      });
      if (res.ok) {
        const data = await res.json();
        setLastPolledAt(new Date().toLocaleTimeString());

        // Update node values locally
        setOpcNodes((prev) =>
          prev.map((node) => {
            const polled = data.polledValues?.find((pv: any) => pv.nodeId === node.id);
            if (polled) {
              return { ...node, currentValue: String(polled.value) };
            }
            return node;
          })
        );

        // Check if any alarms triggered
        if (data.generatedAlarms && data.generatedAlarms.length > 0) {
          data.generatedAlarms.forEach((alarm: PLCAlarm) => {
            onIngestLiveAlarm(alarm);
            setPollLog((prev) => [
              `[${new Date().toLocaleTimeString()}] ALARM TRIGGERED: ${alarm.tag} - ${alarm.message}`,
              ...prev.slice(0, 19),
            ]);
          });
        } else {
          setPollLog((prev) => [
            `[${new Date().toLocaleTimeString()}] Polled ${selectedNodes.length} nodes (Status: Nominal)`,
            ...prev.slice(0, 19),
          ]);
        }
      }
    } catch (e) {
      console.error("Polling error", e);
    }
  };

  // Timer loop for auto-polling
  useEffect(() => {
    let timer: any = null;
    if (isPolling) {
      handlePollOpc();
      timer = setInterval(handlePollOpc, pollingInterval);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPolling, pollingInterval, selectedNodes]);

  // MQTT Sparkplug B Simulator
  useEffect(() => {
    let mqttTimer: any = null;
    if (isSimulatingMqtt && mqttConnected) {
      mqttTimer = setInterval(() => {
        const timestamp = new Date().toISOString();
        const current = (13.8 + Math.random() * 2.8).toFixed(1);
        const vib = (4.2 + Math.random() * 2.2).toFixed(2);
        const speed = (1.2 + Math.random() * 0.1).toFixed(2);

        const newMsg: MQTTMessage = {
          id: `mqtt_${Date.now()}`,
          topic: subscribedTopic,
          timestamp,
          metrics: [
            { name: "Motor_Current_A", value: parseFloat(current), type: "Float" },
            { name: "Vibration_RMS_mm_s", value: parseFloat(vib), type: "Float" },
            { name: "Line_Speed_mps", value: parseFloat(speed), type: "Float" },
            { name: "PhotoEye_Infeed", value: Math.random() > 0.3 ? true : false, type: "Boolean" },
          ],
          rawPayload: JSON.stringify({
            timestamp: Date.now(),
            metrics: [
              { name: "Motor_Current_A", alias: 101, value: parseFloat(current) },
              { name: "Vibration_RMS_mm_s", alias: 102, value: parseFloat(vib) },
            ],
            seq: Math.floor(Math.random() * 10000),
          }),
        };

        setMqttMessages((prev) => [newMsg, ...prev.slice(0, 14)]);
      }, 4000);
    }
    return () => {
      if (mqttTimer) clearInterval(mqttTimer);
    };
  }, [isSimulatingMqtt, mqttConnected, subscribedTopic]);

  const toggleNodeSelection = (nodeId: string) => {
    if (selectedNodes.includes(nodeId)) {
      setSelectedNodes(selectedNodes.filter((id) => id !== nodeId));
    } else {
      setSelectedNodes([...selectedNodes, nodeId]);
    }
  };

  return (
    <div className="bg-[#16191f] rounded-sm border border-industrial p-5 space-y-6 shadow-sm">
      {/* Header with Protocol Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-industrial pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-amber-500" />
            <h2 className="font-display text-sm font-bold text-slate-100 uppercase tracking-wide">
              Connected Factory Bridge (SCADA & Industrial IoT)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate and monitor direct hardware register polling via OPC UA (Siemens/Beckhoff) and MQTT Sparkplug B.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-[#12151a] p-1 rounded-sm border border-industrial">
          <button
            onClick={() => setActiveTab("opcua")}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "opcua"
                ? "bg-amber-500 text-black font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Server className="h-3.5 w-3.5" />
            OPC UA Bridge
          </button>
          <button
            onClick={() => setActiveTab("mqtt")}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "mqtt"
                ? "bg-amber-500 text-black font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wifi className="h-3.5 w-3.5" />
            MQTT Sparkplug B
          </button>
          <button
            onClick={() => setActiveTab("rbac")}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "rbac"
                ? "bg-amber-500 text-black font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Role Access ({userRole})
          </button>
        </div>
      </div>

      {/* --- TAB 1: OPC UA SERVER CONNECTOR --- */}
      {activeTab === "opcua" && (
        <div className="space-y-6">
          {/* Server Connection Banner */}
          <div className="bg-[#12151a] p-4 rounded-sm border border-industrial grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Endpoint URI</span>
              <span className="text-xs font-mono font-semibold text-slate-200 block truncate">
                opc.tcp://192.168.1.120:4840
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Security Policy</span>
              <span className="text-xs font-mono font-semibold text-amber-400 block truncate">
                Basic256Sha256 (Sign & Encrypt)
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Connection State</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-400">CONNECTED (12ms)</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={fetchOpcNodes}
                disabled={isConnectingOpc}
                className="px-2.5 py-1.5 bg-[#1c2026] hover:bg-[#232830] text-slate-300 rounded-sm border border-industrial text-[11px] font-mono flex items-center gap-1 cursor-pointer transition"
              >
                <RefreshCw className={`h-3 w-3 ${isConnectingOpc ? "animate-spin" : ""}`} />
                Discover Nodes
              </button>
            </div>
          </div>

          {/* Polling Controls & Active Configuration */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1c2026] p-3 rounded-sm border border-industrial">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPolling(!isPolling)}
                className={`px-3 py-1.5 rounded-sm font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                  isPolling
                    ? "bg-rose-500 text-black hover:bg-rose-600"
                    : "bg-emerald-500 text-black hover:bg-emerald-600"
                }`}
              >
                {isPolling ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {isPolling ? "Halt Polling" : "Start Live Polling"}
              </button>

              <button
                onClick={handlePollOpc}
                className="px-3 py-1.5 bg-[#12151a] hover:bg-[#16191f] text-slate-200 rounded-sm border border-industrial font-mono text-xs flex items-center gap-1.5 cursor-pointer transition"
              >
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Single Poll Trigger
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <span>Cycle:</span>
                <select
                  value={pollingInterval}
                  onChange={(e) => setPollingInterval(Number(e.target.value))}
                  className="bg-[#12151a] border border-industrial text-slate-200 px-2 py-1 rounded text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value={1000}>1.0s (High-rate)</option>
                  <option value={3000}>3.0s (Standard)</option>
                  <option value={5000}>5.0s (Low-bandwidth)</option>
                </select>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              {lastPolledAt ? `Last synchronized: ${lastPolledAt}` : "Polling idle"}
            </div>
          </div>

          {/* Node Tree Register Table */}
          <div className="overflow-x-auto border border-industrial rounded-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#12151a] text-slate-400 border-b border-industrial font-mono uppercase text-[10px] tracking-wider">
                  <th className="p-3 w-10">Poll</th>
                  <th className="p-3">Node Identifier (Address Space)</th>
                  <th className="p-3">Display Name</th>
                  <th className="p-3">Data Type</th>
                  <th className="p-3">Live Value</th>
                  <th className="p-3">Access</th>
                  <th className="p-3">Quality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial">
                {opcNodes.map((node) => {
                  const isChecked = selectedNodes.includes(node.id);
                  return (
                    <tr
                      key={node.id}
                      className={`hover:bg-[#1c2026]/60 transition ${
                        isChecked ? "bg-[#1c2026]/30" : ""
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleNodeSelection(node.id)}
                          className="rounded border-industrial bg-[#12151a] text-amber-500 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-mono text-[11px] text-amber-400/90">{node.id}</td>
                      <td className="p-3 font-semibold text-slate-200">{node.displayName}</td>
                      <td className="p-3 font-mono text-slate-400">{node.dataType}</td>
                      <td className="p-3 font-mono font-bold text-slate-100">
                        <span className="bg-[#12151a] px-2 py-0.5 rounded border border-industrial">
                          {node.currentValue} {node.unit}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[10px]">{node.accessLevel}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Good
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Polling Event Terminal Log */}
          <div className="bg-[#12151a] p-3 rounded-sm border border-industrial font-mono text-xs">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-amber-500" />
                OPC UA Diagnostic Log Stream
              </span>
              <span>{pollLog.length} events</span>
            </div>
            <div className="bg-[#0b0d10] p-2.5 rounded border border-industrial max-h-32 overflow-y-auto space-y-1 text-[11px]">
              {pollLog.length === 0 ? (
                <div className="text-slate-600 italic">No polling activity recorded yet. Press "Start Live Polling" or "Single Poll Trigger".</div>
              ) : (
                pollLog.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.includes("ALARM")
                        ? "text-rose-400 font-bold"
                        : "text-slate-400"
                    }
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: MQTT SPARKPLUG B CLIENT --- */}
      {activeTab === "mqtt" && (
        <div className="space-y-6">
          {/* MQTT Broker Status */}
          <div className="bg-[#12151a] p-4 rounded-sm border border-industrial grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Broker Host</span>
              <span className="text-xs font-mono font-semibold text-slate-200 block truncate">
                mqtts://broker.plant-intranet.lan:8883
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Protocol Payload</span>
              <span className="text-xs font-mono font-semibold text-amber-400 block truncate">
                Sparkplug B (ISO/IEC 20237)
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Client Status</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-emerald-400">SUBSCRIBED</span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsSimulatingMqtt(!isSimulatingMqtt)}
                className={`px-3 py-1.5 rounded-sm font-mono text-xs font-bold cursor-pointer transition ${
                  isSimulatingMqtt
                    ? "bg-rose-500 text-black hover:bg-rose-600"
                    : "bg-emerald-500 text-black hover:bg-emerald-600"
                }`}
              >
                {isSimulatingMqtt ? "Pause Stream" : "Resume Stream"}
              </button>
            </div>
          </div>

          {/* Topic Subscription Input */}
          <div className="bg-[#1c2026] p-3 rounded-sm border border-industrial flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wide shrink-0">
              Active Topic:
            </span>
            <input
              type="text"
              value={subscribedTopic}
              onChange={(e) => setSubscribedTopic(e.target.value)}
              className="w-full bg-[#12151a] border border-industrial px-3 py-1.5 rounded-sm font-mono text-xs text-amber-400 focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] font-mono text-slate-500 shrink-0">QoS: 1 (At least once)</span>
          </div>

          {/* Incoming Sparkplug B Payload Messages */}
          <div className="space-y-3">
            <h3 className="font-display text-xs font-bold text-slate-300 uppercase tracking-wider">
              Decoded Sparkplug B Telemetry Stream
            </h3>

            <div className="space-y-2 max-h-[380px] overflow-y-auto">
              {mqttMessages.length === 0 ? (
                <div className="bg-[#12151a] p-6 text-center text-xs text-slate-500 rounded-sm border border-industrial italic">
                  Awaiting incoming Sparkplug B packets from broker...
                </div>
              ) : (
                mqttMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-[#12151a] p-3 rounded-sm border border-industrial space-y-2 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-amber-400 font-semibold">{msg.topic}</span>
                      <span className="text-slate-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {msg.metrics.map((m, idx) => (
                        <div key={idx} className="bg-[#1c2026] p-1.5 rounded border border-industrial text-[11px]">
                          <span className="text-[9px] font-mono text-slate-400 block truncate">{m.name}</span>
                          <span className="font-mono font-bold text-slate-100">
                            {typeof m.value === "boolean" ? (m.value ? "TRUE" : "FALSE") : m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: ROLE-BASED ACCESS CONTROL (RBAC) --- */}
      {activeTab === "rbac" && (
        <div className="space-y-6">
          <div className="bg-[#12151a] p-4 rounded-sm border border-industrial">
            <h3 className="font-display text-xs font-bold text-slate-100 uppercase tracking-wide mb-1">
              Simulated Role-Based Workspace Access
            </h3>
            <p className="text-xs text-slate-400">
              Toggle your authenticated role to preview permission boundaries across ingestion, manual edits, and AI synthesis.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <button
                onClick={() => setUserRole("ADMIN")}
                className={`p-3 rounded-sm border text-left cursor-pointer transition ${
                  userRole === "ADMIN"
                    ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30"
                    : "border-industrial bg-[#1c2026] hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold text-amber-500 uppercase">Admin / Lead</span>
                  {userRole === "ADMIN" && <CheckCircle2 className="h-4 w-4 text-amber-500" />}
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Full control: Add/edit raw logs, change ingestion rules, configure OPC UA bridges, and run Gemini AI.
                </p>
              </button>

              <button
                onClick={() => setUserRole("ANALYST")}
                className={`p-3 rounded-sm border text-left cursor-pointer transition ${
                  userRole === "ANALYST"
                    ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30"
                    : "border-industrial bg-[#1c2026] hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold text-slate-200 uppercase">Reliability Analyst</span>
                  {userRole === "ANALYST" && <CheckCircle2 className="h-4 w-4 text-amber-500" />}
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Standard access: View data, execute AI root cause analysis, export reports, and adjust visual filters.
                </p>
              </button>

              <button
                onClick={() => setUserRole("VIEWER")}
                className={`p-3 rounded-sm border text-left cursor-pointer transition ${
                  userRole === "VIEWER"
                    ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30"
                    : "border-industrial bg-[#1c2026] hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold text-slate-400 uppercase">Shopfloor Viewer</span>
                  {userRole === "VIEWER" && <CheckCircle2 className="h-4 w-4 text-amber-500" />}
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Read-only view: Inspect timelines and dashboards. Cannot mutate machine records or alter settings.
                </p>
              </button>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="overflow-x-auto border border-industrial rounded-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#12151a] text-slate-400 border-b border-industrial font-mono uppercase text-[10px] tracking-wider">
                  <th className="p-3">Feature / Capability</th>
                  <th className="p-3 text-center">Admin</th>
                  <th className="p-3 text-center">Analyst</th>
                  <th className="p-3 text-center">Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial text-slate-300">
                <tr>
                  <td className="p-3 font-semibold">Execute AI Root Cause Analysis</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✔ Yes</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✔ Yes</td>
                  <td className="p-3 text-center text-rose-400">✖ Read cached</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Upload CSV / Modify Ingestion Regex</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✔ Yes</td>
                  <td className="p-3 text-center text-rose-400">✖ No</td>
                  <td className="p-3 text-center text-rose-400">✖ No</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Add / Edit Manual Shift Operator Logs</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✔ Yes</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✔ Yes</td>
                  <td className="p-3 text-center text-rose-400">✖ No</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Configure OPC UA & MQTT Bridges</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✔ Yes</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✔ Yes</td>
                  <td className="p-3 text-center text-rose-400">✖ No</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Export PDF/JSON Incident Reports</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✔ Yes</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✔ Yes</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✔ Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
