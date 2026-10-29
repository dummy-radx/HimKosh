import React, { useState, useEffect } from "react";
import { 
  Warehouse, 
  Sun, 
  BatteryCharging, 
  Circle,
  AlertTriangle
} from "lucide-react";
import { FacilityOverview } from "../types";

interface TopHUDProps {
  overview: FacilityOverview | null;
  onNavigateTab: (tab: string) => void;
  onOpenAlerts: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({ overview, onNavigateTab, onOpenAlerts }) => {
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

  if (!overview) return null;

  const { capacity, power, alertsSummary } = overview;
  const criticalCount = alertsSummary.critical;
  const activeAlerts = alertsSummary.totalActive;

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-neutral-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs select-none shadow-xs">
      {/* Location & Coordinates */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-neutral-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-black tracking-wide">
            {overview.facility.name.toUpperCase()}
          </span>
          <span className="text-neutral-300 hidden sm:inline">/</span>
          <span className="text-neutral-500 text-[11px] hidden sm:inline">
            32.7266° N, 74.8570° E
          </span>
        </div>
      </div>

      {/* Center Metrics: Global Capacity & Energy Mix */}
      <div className="flex items-center gap-5">
        {/* Storage Capacity Gauge */}
        <div 
          onClick={() => onNavigateTab("inventory")}
          className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 hover:border-neutral-400 transition-all cursor-pointer group shadow-2xs"
          title="Click to view Produce Inventory"
        >
          <Warehouse className="w-3.5 h-3.5 text-neutral-600 group-hover:text-black transition-colors" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-neutral-500 font-semibold">STORAGE:</span>
              <span className="font-bold text-black">{capacity.totalUsedMT} / {capacity.totalCapacityMT} MT</span>
              <span className="text-emerald-700 font-bold">({capacity.occupancyPercent}%)</span>
            </div>
            <div className="w-28 h-1.5 rounded-full bg-neutral-200 overflow-hidden mt-1">
              <div 
                className="h-full bg-neutral-900 rounded-full transition-all duration-300" 
                style={{ width: `${capacity.occupancyPercent}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold hidden md:inline">
            {capacity.availableSpaceMT} MT FREE
          </span>
        </div>

        {/* Solar & BESS Microgrid */}
        <div 
          onClick={() => onNavigateTab("power")}
          className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 hover:border-neutral-400 transition-all cursor-pointer group shadow-2xs"
          title="Click to view Microgrid & Power"
        >
          <Sun className="w-3.5 h-3.5 text-amber-600" />
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-neutral-500 font-semibold">SOLAR:</span>
            <span className="font-bold text-black">{power.solarGenerationKw} kW</span>
            <span className="text-neutral-300">•</span>
            <BatteryCharging className="w-3 h-3 text-emerald-600" />
            <span className="text-emerald-700 font-bold">{power.batterySocPercent}% BESS</span>
            {power.gridExportKw > 0 && (
              <span className="text-amber-700 hidden lg:inline font-bold">
                +{power.gridExportKw} kW EXPORT
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Security Status & Clock */}
      <div className="flex items-center gap-4">
        {activeAlerts > 0 ? (
          <button
            onClick={onOpenAlerts}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
              criticalCount > 0
                ? "border-amber-400 bg-amber-50 text-amber-800 animate-pulse"
                : "border-amber-300 bg-amber-50 text-amber-800"
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>{activeAlerts} {activeAlerts === 1 ? "ALERT" : "ALERTS"}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
            <Circle className="w-1.5 h-1.5 fill-current" />
            <span>ALL VAULTS SECURE</span>
          </div>
        )}

        <div className="text-right pl-3 border-l border-neutral-200">
          <span className="font-bold text-black text-xs tracking-wider">
            {time}
          </span>
        </div>
      </div>
    </div>
  );
};
