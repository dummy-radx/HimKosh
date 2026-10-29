import React from "react";
import { 
  Snowflake, 
  LayoutGrid, 
  Package, 
  Leaf, 
  Sun, 
  Wrench, 
  SlidersHorizontal, 
  Volume2, 
  VolumeX, 
  Bell
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSimulation: () => void;
  onOpenAlerts: () => void;
  alertsCount: number;
  criticalCount: number;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSimulation,
  onOpenAlerts,
  alertsCount,
  criticalCount,
  audioEnabled,
  setAudioEnabled
}) => {
  const navItems = [
    { id: "overview", label: "Cockpit", icon: LayoutGrid, tag: "01" },
    { id: "inventory", label: "Inventory", icon: Package, tag: "02" },
    { id: "crops", label: "Crop Matrix", icon: Leaf, tag: "03" },
    { id: "power", label: "Microgrid", icon: Sun, tag: "04" },
    { id: "equipment", label: "Machinery", icon: Wrench, tag: "05" },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-white border-r border-neutral-200 flex flex-col justify-between shrink-0 select-none z-30 transition-all font-mono shadow-sm">
      {/* Brand Header */}
      <div>
        <div className="p-4 lg:p-6 border-b border-neutral-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <Snowflake className="w-5 h-5 text-white" />
          </div>
          <div className="hidden lg:block">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-lg tracking-wider text-black">
                ARCTIC<span className="text-emerald-600">.</span>PULSE
              </span>
            </div>
            <p className="text-[10px] text-neutral-500 tracking-wider">
              COLD CHAIN OS // v2.4
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-2 lg:p-3 space-y-1 mt-3">
          <div className="hidden lg:block px-3 py-1 text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
            Navigation Controls
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-center lg:justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-black text-white shadow-sm"
                    : "text-neutral-600 hover:text-black hover:bg-neutral-100"
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline text-xs tracking-tight">{item.label}</span>
                </div>
                <span className={`hidden lg:inline text-[9px] px-1.5 py-0.5 rounded ${
                  isActive ? "bg-neutral-800 text-neutral-200 font-mono font-bold" : "text-neutral-400"
                }`}>
                  {item.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Tool Deck */}
      <div className="p-3 lg:p-4 border-t border-neutral-200 space-y-2">
        {/* Simulator Button */}
        <button
          onClick={onOpenSimulation}
          className="w-full flex items-center justify-center lg:justify-start gap-2.5 px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
          title="Open Simulation Scenarios"
        >
          <SlidersHorizontal className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="hidden lg:inline text-[11px]">SCENARIO SIM</span>
        </button>

        {/* Alarms Drawer Trigger */}
        <button
          onClick={onOpenAlerts}
          className={`w-full flex items-center justify-center lg:justify-between px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
            criticalCount > 0
              ? "border-amber-400 bg-amber-50 text-amber-800 animate-pulse font-bold"
              : alertsCount > 0
              ? "border-amber-300 bg-amber-50/80 text-amber-800 font-bold"
              : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
          }`}
          title="Safety Alarms Log"
        >
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline text-[11px]">AUDIT ALARMS</span>
          </div>
          {alertsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center">
              {alertsCount}
            </span>
          )}
        </button>

        {/* Audio Mute & Telemetry Status */}
        <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-neutral-500">
          <div className="hidden lg:flex items-center gap-1.5 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-emerald-700 font-bold">ONLINE</span>
          </div>

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-black transition-all cursor-pointer ml-auto"
            title={audioEnabled ? "Alert Audio Active (Click to Mute)" : "Alert Audio Muted"}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
