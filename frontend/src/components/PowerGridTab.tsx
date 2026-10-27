import React from "react";
import { 
  Sun, 
  BatteryCharging, 
  Snowflake, 
  Zap, 
  Leaf, 
  DollarSign, 
  ArrowRight, 
  ShieldCheck, 
  Power, 
  Flame,
  Radio
} from "lucide-react";
import { PowerState } from "../types";

interface PowerGridTabProps {
  power: PowerState;
  onSetPowerMode: (mode: string) => Promise<void>;
}

export const PowerGridTab: React.FC<PowerGridTabProps> = ({ power, onSetPowerMode }) => {
  return (
    <div className="space-y-6">
      {/* Microgrid Header & Mode Selector */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Sun className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white font-heading">
              Solar PV Generation & Hybrid Energy Storage (BESS)
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Integrated 100 kW Rooftop Solar PV, 240 kWh Lithium-Iron-Phosphate Battery Bank, and 350 TR-h Ice Thermal Storage for 100% resilient cold chain cooling.
          </p>
        </div>

        {/* Quick Power Mode Simulation Controls */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: "SOLAR_HYBRID", label: "Solar Hybrid", icon: Sun },
            { id: "BATTERY_BACKUP", label: "Grid Outage (BESS)", icon: BatteryCharging },
            { id: "THERMAL_DISCHARGE", label: "Thermal Ice Mode", icon: Snowflake }
          ].map(m => {
            const Icon = m.icon;
            const active = power.mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSetPowerMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Solar Generation */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Solar PV Generation
            </span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Sun className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {power.solarGenerationKw}
            </span>
            <span className="text-sm font-semibold text-slate-400">kW Output</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${(power.solarGenerationKw / power.solarPeakCapacityKw) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Peak: {power.solarPeakCapacityKw} kW</span>
            <span className="text-amber-400 font-medium">Daily: {power.solarDailyProductionKwh} kWh</span>
          </div>
        </div>

        {/* 2. Battery Storage (BESS) */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              BESS Battery Bank
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <BatteryCharging className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {power.batterySocPercent}%
            </span>
            <span className="text-sm font-semibold text-slate-400">State of Charge</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${power.batterySocPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400">
            <span className="text-emerald-300 font-mono">{power.batteryStoredKwh} / {power.batteryCapacityKwh} kWh</span>
            <span className="text-slate-300 font-semibold">{power.batteryRuntimeHours} hrs Backup</span>
          </div>
        </div>

        {/* 3. Thermal Energy Storage (Ice Bank) */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Thermal Ice Bank
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
              <Snowflake className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {power.thermalStorageChargePercent}%
            </span>
            <span className="text-sm font-semibold text-slate-400">Cold Charge</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${power.thermalStorageChargePercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400">
            <span className="text-cyan-300 font-mono">{power.thermalStoredTonHours} / {power.thermalCapacityTonHours} TR-h</span>
            <span className="text-slate-300 font-semibold">{power.thermalReserveHours} hrs Chill Reserve</span>
          </div>
        </div>

        {/* 4. Facility Load & Grid Net */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Facility Chill Load
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {power.facilityLoadKw}
            </span>
            <span className="text-sm font-semibold text-slate-400">kW Active</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (power.facilityLoadKw / 80) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Grid Import: {power.gridImportKw} kW</span>
            <span className="text-emerald-400 font-bold">Export: +{power.gridExportKw} kW</span>
          </div>
        </div>
      </div>

      {/* Visual Power Flow Diagram & Environmental Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Power Flow Architecture Schematic */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/10">
          <h3 className="text-base font-bold text-white mb-4 font-heading flex items-center justify-between">
            <span>Live Energy Distribution & Power Flow</span>
            <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-md">
              Mode: {power.mode}
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Generation Node */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-col items-center text-center">
              <Sun className="w-8 h-8 text-amber-400 mb-2 animate-spin-slow" />
              <span className="text-xs font-bold text-white">Rooftop Solar Array</span>
              <span className="font-mono text-base font-extrabold text-amber-400 mt-1">
                {power.solarGenerationKw} kW
              </span>
              <span className="text-[10px] text-slate-400 mt-1">Irradiance: {power.solarIrradiancePercent}%</span>
            </div>

            {/* Inverter / Router Node */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex flex-col items-center text-center relative">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping absolute -top-1.5" />
              <Zap className="w-8 h-8 text-cyan-400 mb-2" />
              <span className="text-xs font-bold text-white">Hybrid Smart Inverter</span>
              <span className="font-mono text-xs font-semibold text-cyan-300 mt-1">
                Efficiency 98.5%
              </span>
              <span className="text-[10px] text-slate-400 mt-1">Direct Bus 400V 3-Phase</span>
            </div>

            {/* Facility & Backups Node */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Cold Chambers (HVAC)</span>
                  <span className="text-[10px] text-slate-400">5 Compressors & Fans</span>
                </div>
                <span className="font-mono font-bold text-indigo-400">{power.facilityLoadKw} kW</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">BESS Battery Charge</span>
                  <span className="text-[10px] text-slate-400">LiFePO4 240 kWh</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">{power.batterySocPercent}%</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Ice Bank Thermal Buffer</span>
                  <span className="text-[10px] text-slate-400">Chilled Glycol Res.</span>
                </div>
                <span className="font-mono font-bold text-cyan-400">{power.thermalStorageChargePercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sustainability & Cost Savings */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-4 font-heading flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-400" />
              <span>ESG & Green Impact</span>
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
                <span className="text-xs text-emerald-300 font-semibold block mb-1">
                  Daily Solar Cost Savings
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    ${power.estimatedDailySavingsUsd.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">/ day</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Equivalent to ~$4,275/mo reduction in commercial electrical utility bills.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-900/40">
                <span className="text-xs text-teal-300 font-semibold block mb-1">
                  Carbon Emission Offset
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-teal-400">
                    {power.co2SavedKgToday}
                  </span>
                  <span className="text-xs text-slate-400">kg CO₂e Today</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Avoided greenhouse gas emissions through zero-carbon solar refrigeration.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Renewable Index:</span>
            <span className="font-bold text-emerald-400 font-mono">92.4% Clean Energy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
