import React from "react";
import { CheckCircle2, Cpu, BarChart3, ShieldCheck, Zap, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "motion/react";

export default function PricingPlans() {
  const [isOpen, setIsOpen] = React.useState(false);

  const plans = [
    {
      name: "Starter",
      price: "€149",
      period: "month",
      desc: "For small-scale localized plants looking to transition away from pen-and-paper logs.",
      features: [
        "Up to 10 PLC csv uploads / month",
        "Basic timeline alignment engine",
        "Unlimited manual operator logs",
        "Standard AI Root Cause report",
        "Single-user login"
      ],
      badge: "Local Plants"
    },
    {
      name: "Professional",
      price: "€499",
      period: "month",
      desc: "Comprehensive plant-wide correlation and precursor detection for high-availability lines.",
      features: [
        "Unlimited PLC log uploads",
        "Advanced statistical precursor alarms",
        "Detailed 5-Whys generator",
        "Cross-shift operator alignment",
        "API integration endpoints",
        "Up to 5 team members",
        "Email support (24h response)"
      ],
      badge: "Factory Standard",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      desc: "Enterprise-grade multi-site continuous telemetry and SCADA system connections.",
      features: [
        "Continuous OPC UA & MQTT bridges",
        "Ignition & Siemens WinCC live connectors",
        "Power BI & SAP custom connectors",
        "Predictive downtime modeling",
        "Auto-generated CAPA compliance reports",
        "Dedicated uptime engineer support",
        "99.9% Telemetry SLA"
      ],
      badge: "Multi-site telemetry"
    }
  ];

  return (
    <div id="pricing-plans-section" className="bg-[#16191f] rounded-sm border border-industrial p-5 mt-6 transition-all shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
      >
        <div>
          <h3 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-tight">
            <Layers className="h-4 w-4 text-amber-500" />
            Product Specs, Roadmap & Pricing
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Explore pricing tiers, competitive advantages, and the industrial roadmap.
          </p>
        </div>
        <div className="bg-[#1c2026] p-1.5 rounded-sm border border-industrial text-slate-400 hover:text-white transition">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mt-6 border-t border-industrial pt-6 space-y-8"
        >
          {/* Competitive Advantages & Roadmap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#12151a]/50 p-4 rounded-sm border border-industrial">
              <h4 className="text-xs font-bold text-amber-500 flex items-center gap-2 mb-3 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-amber-500" /> Competitive Advantages
              </h4>
              <ul className="text-xs space-y-2.5 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">✔</span>
                  <span><strong>AI Explains the Data:</strong> Translates complex hex register alarms and code lines into human root causes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">✔</span>
                  <span><strong>Cross-System Correlation:</strong> Seamlessly matches operator shift notes to physical VFD trips and electrical spikes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">✔</span>
                  <span><strong>Shift-Aware Analysis:</strong> Accounts for transition fatigue and operator-specific response differences.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">✔</span>
                  <span><strong>No-Blame Culture:</strong> Guides continuous improvement instead of finding operator error scapegoats.</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#12151a]/50 p-4 rounded-sm border border-industrial">
              <h4 className="text-xs font-bold text-amber-500 flex items-center gap-2 mb-3 uppercase tracking-wider">
                <Cpu className="h-4 w-4 text-amber-500" /> SCADA & Live Connectivity Roadmap
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="bg-[#16191f] p-2 rounded-sm border border-industrial">
                  <span className="font-semibold text-slate-200">OPC UA Live</span>
                  <p className="text-[10px] text-slate-400">Direct register polling</p>
                </div>
                <div className="bg-[#16191f] p-2 rounded-sm border border-industrial">
                  <span className="font-semibold text-slate-200">MQTT Broker Ingestion</span>
                  <p className="text-[10px] text-slate-400">Low-bandwidth remote IoT</p>
                </div>
                <div className="bg-[#16191f] p-2 rounded-sm border border-industrial">
                  <span className="font-semibold text-slate-200">Inductive Ignition</span>
                  <p className="text-[10px] text-slate-400">Direct system integration</p>
                </div>
                <div className="bg-[#16191f] p-2 rounded-sm border border-industrial">
                  <span className="font-semibold text-slate-200">Siemens / Rockwell</span>
                  <p className="text-[10px] text-slate-400">S7 and FactoryTalk bridges</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div>
            <h4 className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase mb-4 text-center">Subscription Pricing Tiers</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => (
                <div
                  key={p.name}
                  className={`bg-[#12151a] rounded-sm p-4 border transition-all ${
                    p.popular ? "border-amber-500 ring-1 ring-amber-500/30" : "border-industrial"
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#1c2026] text-slate-300 border border-industrial">
                      {p.badge}
                    </span>
                    {p.popular && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-amber-500 text-black">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <h5 className="font-display text-sm font-bold text-slate-100 mt-2 uppercase tracking-wide">{p.name}</h5>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl font-bold font-display text-amber-500">{p.price}</span>
                    <span className="text-xs text-slate-500">/ {p.period}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 min-h-[32px]">{p.desc}</p>
                  
                  <ul className="mt-4 space-y-2 border-t border-industrial pt-3">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[10px] text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
