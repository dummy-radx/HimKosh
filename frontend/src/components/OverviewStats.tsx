import React from "react";
import { 
  Warehouse, 
  Sun, 
  BatteryCharging, 
  ThermometerSnowflake, 
  ShieldAlert, 
  ArrowUpRight, 
  TrendingUp,
  Cpu
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Storage Capacity Card */}
      <div 
        onClick={() => onNavigateToTab("inventory")}
        className="glass-panel rounded-2xl p-4.5 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 group cursor-pointer relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all" />
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Storage Capacity
          </span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
            <Warehouse className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-white font-heading">
            {capacity.totalUsedMT}
          </span>
          <span className="text-xs text-slate-400">
            / {capacity.totalCapacityMT} MT
          </span>
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            {capacity.occupancyPercent}% Occupied
          </span>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
            style={{ width: `${capacity.occupancyPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-emerald-400 font-medium">
            {capacity.availableSpaceMT} MT Available
          </span>
          <span className="flex items-center gap-0.5 text-slate-500 group-hover:text-cyan-400 transition-colors">
            Manage <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 2. Solar & Energy Generation */}
      <div 
        onClick={() => onNavigateToTab("power")}
        className="glass-panel rounded-2xl p-4.5 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 group cursor-pointer relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Clean Microgrid
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <Sun className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-white font-heading">
            {power.solarGenerationKw}
          </span>
          <span className="text-xs text-slate-400">kW Solar</span>
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <BatteryCharging className="w-3 h-3" /> {power.batterySocPercent}% BESS
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
            style={{ width: `${(power.solarGenerationKw / power.solarPeakCapacityKw) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-teal-300">
            {power.gridExportKw > 0 ? `Exporting +${power.gridExportKw} kW` : `Load: ${power.facilityLoadKw} kW`}
          </span>
          <span className="flex items-center gap-0.5 text-slate-500 group-hover:text-emerald-400 transition-colors">
            Solar Flow <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 3. Cold Storage Chambers Status */}
      <div 
        onClick={() => onNavigateToTab("overview")}
        className="glass-panel rounded-2xl p-4.5 border border-white/10 hover:border-indigo-500/40 transition-all duration-300 group cursor-pointer relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Vault Equilibrium
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <ThermometerSnowflake className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-white font-heading">
            {chambers.length}
          </span>
          <span className="text-xs text-slate-400">Chambers Active</span>
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            Avg {avgTemp}°C
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-2.5">
          {chambers.map((c) => {
            const isCritical = c.status.startsWith("CRITICAL");
            const isWarning = c.status === "WARNING";
            const isDefrost = c.status === "DEFROSTING";
            return (
              <div 
                key={c.id} 
                title={`${c.name}: ${c.currentTemp}°C (${c.status})`}
                className={`flex-1 h-2 rounded-full transition-all ${
                  isCritical 
                    ? "bg-rose-500 animate-pulse" 
                    : isWarning 
                    ? "bg-amber-400" 
                    : isDefrost 
                    ? "bg-blue-400" 
                    : "bg-emerald-500"
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Target drift &lt; 0.3°C</span>
          <span className="flex items-center gap-0.5 text-slate-500 group-hover:text-indigo-400 transition-colors">
            Sensors <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 4. Equipment Health & Alert Center */}
      <div 
        onClick={() => onNavigateToTab("equipment")}
        className="glass-panel rounded-2xl p-4.5 border border-white/10 hover:border-amber-500/40 transition-all duration-300 group cursor-pointer relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Machinery & Alerts
          </span>
          <div className={`p-2 rounded-xl border group-hover:scale-110 transition-transform ${
            alertsSummary.critical > 0 
              ? "bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}>
            {alertsSummary.critical > 0 ? <ShieldAlert className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-white font-heading">
            {equipmentSummary.healthyUnits}
          </span>
          <span className="text-xs text-slate-400">
            / {equipmentSummary.totalUnits} Units Healthy
          </span>
          {alertsSummary.totalActive > 0 && (
            <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border ${
              alertsSummary.critical > 0
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : "bg-amber-500/20 text-amber-300 border-amber-500/40"
            }`}>
              {alertsSummary.totalActive} Notice{alertsSummary.totalActive > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${(equipmentSummary.healthyUnits / equipmentSummary.totalUnits) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className={alertsSummary.critical > 0 ? "text-rose-400 font-semibold" : "text-slate-400"}>
            {alertsSummary.critical > 0 ? "Action Required" : "Bitzer Compressors OK"}
          </span>
          <span className="flex items-center gap-0.5 text-slate-500 group-hover:text-amber-400 transition-colors">
            Diagnostics <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
