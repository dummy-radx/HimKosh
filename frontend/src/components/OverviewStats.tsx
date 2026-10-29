import React from "react";
import { 
  Warehouse, 
  Sun, 
  BatteryCharging, 
  ThermometerSnowflake, 
  Cpu,
  ArrowUpRight
} from "lucide-react";
import { FacilityOverview } from "../types";

interface OverviewStatsProps {
  overview: FacilityOverview;
  onNavigateToTab: (tab: string) => void;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({ overview, onNavigateToTab }) => {
  const { capacity, power, alertsSummary, equipmentSummary, chambers } = overview;

  const avgTemp = chambers.length > 0
    ? (chambers.reduce((acc, c) => acc + c.currentTemp, 0) / chambers.length).toFixed(1)
    : "0.0";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      {/* 1. Storage Capacity Card */}
      <div 
        onClick={() => onNavigateToTab("inventory")}
        className="aww-card rounded-2xl p-5 group cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="aww-tag text-[10px] text-neutral-400">
            METRIC // 01 · CAPACITY
          </span>
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
            <Warehouse className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-black text-white font-heading tracking-tight">
            {capacity.totalUsedMT}
          </span>
          <span className="text-sm font-mono text-neutral-400">
            / {capacity.totalCapacityMT} MT
          </span>
          <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded border border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]">
            {capacity.occupancyPercent}% FULL
          </span>
        </div>

        {/* Minimalist Gauge */}
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
          <div 
            className="h-full bg-white transition-all duration-500 rounded-full"
            style={{ width: `${capacity.occupancyPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#22c55e]">
            {capacity.availableSpaceMT} MT VACANT
          </span>
          <span className="flex items-center gap-0.5 text-neutral-400 group-hover:text-white transition-colors">
            INVENTORY <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 2. Solar & Microgrid */}
      <div 
        onClick={() => onNavigateToTab("power")}
        className="aww-card rounded-2xl p-5 group cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="aww-tag text-[10px] text-neutral-400">
            METRIC // 02 · ENERGY
          </span>
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#eab308] group-hover:bg-[#eab308] group-hover:text-black transition-all">
            <Sun className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-black text-white font-heading tracking-tight">
            {power.solarGenerationKw}
          </span>
          <span className="text-sm font-mono text-neutral-400">kW SOLAR</span>
          <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded border border-[#eab308]/40 bg-[#eab308]/10 text-[#eab308]">
            {power.batterySocPercent}% BESS
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
          <div 
            className="h-full bg-[#eab308] transition-all duration-500 rounded-full"
            style={{ width: `${(power.solarGenerationKw / power.solarPeakCapacityKw) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#eab308]">
            {power.gridExportKw > 0 ? `+${power.gridExportKw} kW EXPORT` : `${power.facilityLoadKw} kW LOAD`}
          </span>
          <span className="flex items-center gap-0.5 text-neutral-400 group-hover:text-white transition-colors">
            GRID <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 3. Vault Equilibrium */}
      <div 
        onClick={() => onNavigateToTab("overview")}
        className="aww-card rounded-2xl p-5 group cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="aww-tag text-[10px] text-neutral-400">
            METRIC // 03 · VAULTS
          </span>
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
            <ThermometerSnowflake className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-black text-white font-heading tracking-tight">
            {chambers.length}
          </span>
          <span className="text-sm font-mono text-neutral-400">CHAMBERS</span>
          <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded border border-white/20 bg-white/10 text-white">
            AVG {avgTemp}°C
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          {chambers.map((c) => {
            const isCritical = c.status.startsWith("CRITICAL");
            const isWarning = c.status === "WARNING";
            const isDefrost = c.status === "DEFROSTING";
            return (
              <div 
                key={c.id} 
                title={`${c.name}: ${c.currentTemp}°C (${c.status})`}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  isCritical 
                    ? "bg-[#eab308] animate-pulse" 
                    : isWarning 
                    ? "bg-yellow-400" 
                    : isDefrost 
                    ? "bg-white" 
                    : "bg-[#22c55e]"
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-neutral-400">TOLERANCE ±0.2°C</span>
          <span className="flex items-center gap-0.5 text-neutral-400 group-hover:text-white transition-colors">
            SENSORS <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 4. Equipment & Diagnostics */}
      <div 
        onClick={() => onNavigateToTab("equipment")}
        className="aww-card rounded-2xl p-5 group cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="aww-tag text-[10px] text-neutral-400">
            METRIC // 04 · MACHINERY
          </span>
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#22c55e] group-hover:bg-[#22c55e] group-hover:text-black transition-all">
            <Cpu className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-black text-white font-heading tracking-tight">
            {equipmentSummary.healthyUnits}
          </span>
          <span className="text-sm font-mono text-neutral-400">
            / {equipmentSummary.totalUnits} ACTIVE
          </span>
          <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded border ${
            alertsSummary.totalActive > 0 
              ? "border-[#eab308]/40 bg-[#eab308]/10 text-[#eab308]" 
              : "border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]"
          }`}>
            {alertsSummary.totalActive > 0 ? `${alertsSummary.totalActive} NOTICES` : "NOMINAL"}
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
          <div 
            className="h-full bg-[#22c55e] transition-all duration-500 rounded-full"
            style={{ width: `${(equipmentSummary.healthyUnits / equipmentSummary.totalUnits) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-neutral-400">BITZER SCREWS ONLINE</span>
          <span className="flex items-center gap-0.5 text-neutral-400 group-hover:text-white transition-colors">
            HEALTH <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
