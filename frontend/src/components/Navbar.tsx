import React, { useState, useEffect } from "react";
import { 
  Snowflake, 
  Bell, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  AlertTriangle, 
  SlidersHorizontal,
  Circle
} from "lucide-react";
import { FacilityOverview } from "../types";

interface NavbarProps {
  overview: FacilityOverview | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAlerts: () => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  onOpenSimulationDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  overview,
  activeTab,
  setActiveTab,
  onOpenAlerts,
  audioEnabled,
  setAudioEnabled,
  onOpenSimulationDrawer
}) => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalAlerts = overview?.alertsSummary.totalActive || 0;
  const criticalAlerts = overview?.alertsSummary.critical || 0;

  return (
    <header className="sticky top-0 z-40 bg-[#050608]/90 backdrop-blur-xl border-b border-white/10 px-5 lg:px-10 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Technical Metadata */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-white text-black flex items-center justify-center font-bold shadow-lg shadow-white/5 transition-transform hover:scale-105">
            <Snowflake className="w-5 h-5 text-black" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-lg tracking-wider text-white">
                ARCTIC<span className="text-[#22c55e]">.</span>PULSE
              </span>
              <span className="aww-tag text-[9px] px-2 py-0.5 rounded border border-white/15 bg-white/5 text-neutral-300">
                INDUSTRIAL OS v2.4
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mt-0.5">
              <span>FACILITY_04 // 32.72° N</span>
              <span className="text-neutral-600">/</span>
              <span className="text-[#22c55e] flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
                TELEMETRY LIVE
              </span>
            </div>
          </div>
        </div>

        {/* Minimalist Awwwards Nav Tabs */}
        <nav className="flex items-center gap-1 p-1 rounded-xl bg-[#0e1116] border border-white/10 overflow-x-auto">
          {[
            { id: "overview", label: "Cold Chambers" },
            { id: "inventory", label: "Produce Inventory" },
            { id: "crops", label: "Crop Guidelines" },
            { id: "power", label: "Solar & Microgrid" },
            { id: "equipment", label: "Equipment Health" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-white text-black font-semibold shadow-md"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Actions & Status */}
        <div className="flex items-center gap-2.5">
          {/* Simulation Toggle */}
          <button
            onClick={onOpenSimulationDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-white/15 bg-white/5 hover:bg-white/10 text-neutral-200 hover:border-white/30 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#eab308]" />
            <span>SIMULATOR</span>
          </button>

          {/* Audio Chime Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              audioEnabled 
                ? "border-emerald-500/30 bg-emerald-500/10 text-[#22c55e] hover:bg-emerald-500/20" 
                : "border-white/10 bg-white/5 text-neutral-500 hover:text-white"
            }`}
            title={audioEnabled ? "Audio Alarms Enabled" : "Audio Alarms Muted"}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Alerts Counter */}
          <button
            onClick={onOpenAlerts}
            className={`relative p-2 rounded-lg border transition-all cursor-pointer ${
              criticalAlerts > 0
                ? "border-[#eab308] bg-[#eab308]/15 text-[#eab308] animate-pulse"
                : totalAlerts > 0
                ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                : "border-white/10 bg-white/5 text-neutral-400 hover:text-white"
            }`}
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#eab308] text-black font-mono font-bold text-[9px] flex items-center justify-center">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Time & Security status */}
          <div className="hidden lg:flex flex-col items-end pl-3 border-l border-white/10 text-right">
            <span className="font-mono text-xs font-bold text-white tracking-wider">
              {time || "00:00:00"}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-mono">
              {criticalAlerts > 0 ? (
                <span className="text-[#eab308] flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> ATTN REQUIRED
                </span>
              ) : (
                <span className="text-[#22c55e] flex items-center gap-1">
                  <Circle className="w-1.5 h-1.5 fill-current" /> ALL SYSTEMS NORMAL
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
