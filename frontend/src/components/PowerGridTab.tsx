import React from "react";
import { 
  Sun, 
  BatteryCharging, 
  Snowflake, 
  Zap, 
  Leaf
} from "lucide-react";
import { PowerState } from "../types";

interface PowerGridTabProps {
  power: PowerState;
  onSetPowerMode: (mode: string) => Promise<void>;
}

export const PowerGridTab: React.FC<PowerGridTabProps> = ({ power, onSetPowerMode }) => {
  return (
    <div className="space-y-6 font-mono">
      {/* Header & Mode Switcher */}
      <div className="aww-card rounded-2xl p-6 bg-white border border-neutral-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="aww-tag text-[10px] text-neutral-500 font-bold">
              MICROGRID // 01 · SOLAR & BESS
            </span>
          </div>
          <h2 className="text-2xl font-black text-black font-heading tracking-tight">
            SOLAR GENERATION & HYBRID BACKUP (BESS)
          </h2>
          <p className="text-xs text-neutral-600 max-w-xl mt-1">
            100 kW Rooftop Photovoltaic Array coupled with 240 kWh LiFePO4 Energy Storage & 350 TR-h Ice Bank.
          </p>
        </div>

        {/* Minimalist Switcher */}
        <div className="flex items-center gap-1.5 bg-neutral-100 p-1.5 rounded-xl border border-neutral-200">
          {[
            { id: "SOLAR_HYBRID", label: "SOLAR HYBRID", icon: Sun },
            { id: "BATTERY_BACKUP", label: "BESS BACKUP", icon: BatteryCharging },
            { id: "THERMAL_DISCHARGE", label: "ICE STORAGE", icon: Snowflake }
          ].map(m => {
            const Icon = m.icon;
            const active = power.mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSetPowerMode(m.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? "bg-black text-white shadow-xs"
                    : "text-neutral-600 hover:text-black hover:bg-neutral-200/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Solar Generation */}
        <div className="aww-card rounded-2xl p-5 bg-white border border-neutral-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="aww-tag text-[10px] text-neutral-500 font-bold">
              ENERGY // SOLAR
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-black font-heading tracking-tight">
              {power.solarGenerationKw}
            </span>
            <span className="text-xs font-mono text-neutral-500 font-bold">kW ACTIVE</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-neutral-100 border border-neutral-200/60 overflow-hidden mb-3">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${(power.solarGenerationKw / power.solarPeakCapacityKw) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-neutral-600 font-medium">
            <span>PEAK: {power.solarPeakCapacityKw} kW</span>
            <span className="text-amber-800 font-bold">YIELD: {power.solarDailyProductionKwh} kWh</span>
          </div>
        </div>

        {/* 2. Battery Storage */}
        <div className="aww-card rounded-2xl p-5 bg-white border border-neutral-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="aww-tag text-[10px] text-neutral-500 font-bold">
              STORAGE // BESS
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <BatteryCharging className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-black font-heading tracking-tight">
              {power.batterySocPercent}%
            </span>
            <span className="text-xs font-mono text-neutral-500 font-bold">CHARGE</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-neutral-100 border border-neutral-200/60 overflow-hidden mb-3">
            <div 
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${power.batterySocPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-neutral-600 font-medium">
            <span className="text-emerald-800 font-bold">{power.batteryStoredKwh}/{power.batteryCapacityKwh} kWh</span>
            <span className="text-neutral-800 font-bold">{power.batteryRuntimeHours}h RUNTIME</span>
          </div>
        </div>

        {/* 3. Thermal Ice Storage */}
        <div className="aww-card rounded-2xl p-5 bg-white border border-neutral-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="aww-tag text-[10px] text-neutral-500 font-bold">
              THERMAL // ICE BANK
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-black border border-neutral-200 flex items-center justify-center">
              <Snowflake className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-black font-heading tracking-tight">
              {power.thermalStorageChargePercent}%
            </span>
            <span className="text-xs font-mono text-neutral-500 font-bold">RESERVE</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-neutral-100 border border-neutral-200/60 overflow-hidden mb-3">
            <div 
              className="h-full bg-neutral-900 rounded-full transition-all duration-500"
              style={{ width: `${power.thermalStorageChargePercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-neutral-600 font-medium">
            <span className="text-black font-bold">{power.thermalStoredTonHours}/{power.thermalCapacityTonHours} TR-h</span>
            <span className="text-neutral-800 font-bold">{power.thermalReserveHours}h CHILL BUFFER</span>
          </div>
        </div>

        {/* 4. Facility Load */}
        <div className="aww-card rounded-2xl p-5 bg-white border border-neutral-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="aww-tag text-[10px] text-neutral-500 font-bold">
              GRID // ACTIVE LOAD
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-black border border-neutral-200 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-black font-heading tracking-tight">
              {power.facilityLoadKw}
            </span>
            <span className="text-xs font-mono text-neutral-500 font-bold">kW LOAD</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-neutral-100 border border-neutral-200/60 overflow-hidden mb-3">
            <div 
              className="h-full bg-neutral-900 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (power.facilityLoadKw / 80) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-neutral-600 font-medium">
            <span>IMPORT: {power.gridImportKw} kW</span>
            <span className="text-emerald-800 font-bold">EXPORT: +{power.gridExportKw} kW</span>
          </div>
        </div>
      </div>

      {/* Distribution Flow & Environmental Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 aww-card rounded-2xl p-6 bg-white border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-black font-heading">
              POWER FLOW ARCHITECTURE
            </h3>
            <span className="text-xs font-mono text-white bg-black px-2.5 py-0.5 rounded font-bold">
              {power.mode}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 border border-amber-200 flex flex-col items-center text-center">
              <Sun className="w-8 h-8 text-amber-600 mb-2" />
              <span className="text-xs font-bold text-black">ROOFTOP SOLAR PV</span>
              <span className="text-lg font-black text-amber-800 mt-1 font-heading">
                {power.solarGenerationKw} kW
              </span>
              <span className="text-[10px] text-neutral-500 mt-1 font-medium">Irradiance {power.solarIrradiancePercent}%</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col items-center text-center">
              <Zap className="w-8 h-8 text-black mb-2" />
              <span className="text-xs font-bold text-black">SMART INVERTER</span>
              <span className="text-sm font-bold text-neutral-700 mt-1">
                400V 3-PHASE
              </span>
              <span className="text-[10px] text-emerald-800 mt-1 font-bold">EFFICIENCY 98.5%</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-black block">REFRIGERATION</span>
                  <span className="text-[10px] text-neutral-500 font-medium">5 Compressors</span>
                </div>
                <span className="font-bold text-black">{power.facilityLoadKw} kW</span>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-black block">BESS BATTERY</span>
                  <span className="text-[10px] text-neutral-500 font-medium">240 kWh LiFePO4</span>
                </div>
                <span className="font-bold text-emerald-800">{power.batterySocPercent}%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-black block">THERMAL BUFFER</span>
                  <span className="text-[10px] text-neutral-500 font-medium">Chilled Glycol</span>
                </div>
                <span className="font-bold text-black">{power.thermalStorageChargePercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ESG */}
        <div className="aww-card rounded-2xl p-6 bg-white border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-black font-heading">
                ESG & CLEAN ENERGY IMPACT
              </h3>
            </div>

            <div className="space-y-3.5">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold block mb-1">
                  DAILY SOLAR COST SAVINGS
                </span>
                <div className="text-2xl font-black font-heading text-emerald-950">
                  ${power.estimatedDailySavingsUsd.toFixed(2)}
                </div>
                <p className="text-[10px] text-neutral-600 mt-1">
                  Replaces grid utility tariffs via rooftop green generation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] text-neutral-600 font-bold block mb-1">
                  CARBON OFFSET TODAY
                </span>
                <div className="text-2xl font-black font-heading text-black">
                  {power.co2SavedKgToday} <span className="text-sm font-normal text-neutral-500">kg CO₂e</span>
                </div>
                <p className="text-[10px] text-neutral-600 mt-1">
                  Zero-emission cold chain refrigeration profile.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 text-[11px] flex items-center justify-between">
            <span className="text-neutral-500">RENEWABLE FRACTION:</span>
            <span className="text-emerald-800 font-bold">92.4% CLEAN</span>
          </div>
        </div>
      </div>
    </div>
  );
};
