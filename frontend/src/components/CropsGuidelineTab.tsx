import React from "react";
import { 
  Leaf, 
  Thermometer, 
  Droplets, 
  Wind, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle 
} from "lucide-react";
import { CropGuideline, Chamber } from "../types";

interface CropsGuidelineTabProps {
  crops: CropGuideline[];
  chambers: Chamber[];
  onSelectChamber: (chamberId: string) => void;
}

export const CropsGuidelineTab: React.FC<CropsGuidelineTabProps> = ({
  crops,
  chambers,
  onSelectChamber
}) => {
  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">
              Crop-Specific Temperature & Climate Guidelines
            </h2>
            <p className="text-xs text-slate-400">
              Science-backed cold chain preservation thresholds. Temperatures deviating beyond safe bounds trigger automated HVAC alarms.
            </p>
          </div>
        </div>
      </div>

      {/* Guidelines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crops.map((crop) => {
          // Check if any chamber is currently housing this crop
          const activeChambers = chambers.filter(c => c.cropId === crop.id);

          return (
            <div 
              key={crop.id}
              className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/60">
                      {crop.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5 font-heading">
                      {crop.name}
                    </h3>
                  </div>

                  <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded-lg border border-emerald-800/50">
                    ${crop.storageFeePerTonPerDay}/MT/day
                  </span>
                </div>

                {/* Ideal Climate Parameters */}
                <div className="space-y-2.5 my-4 text-xs">
                  {/* Ideal Temp */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-400" /> Optimal Temp:
                    </span>
                    <span className="font-mono font-bold text-cyan-300">
                      {crop.idealTempMin}°C to {crop.idealTempMax}°C
                    </span>
                  </div>

                  {/* Critical Safety Limits */}
                  <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/40 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Threshold Trigger:
                    </span>
                    <span className="font-mono font-semibold text-rose-300 text-[11px]">
                      &gt; {crop.maxSafeTemp}°C or &lt; {crop.minSafeTemp}°C
                    </span>
                  </div>

                  {/* Humidity Range */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" /> Target Relative Humidity:
                    </span>
                    <span className="font-mono font-bold text-blue-300">
                      {crop.idealHumidityMin}% – {crop.idealHumidityMax}% RH
                    </span>
                  </div>

                  {/* Ethylene Sensitivity */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-purple-400" /> Max Ethylene Limit:
                    </span>
                    <span className="font-mono font-medium text-purple-300">
                      &le; {crop.maxEthylenePpm} ppm
                    </span>
                  </div>

                  {/* Max Safe Storage Life */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" /> Max Storage Duration:
                    </span>
                    <span className="font-mono font-medium text-amber-300">
                      Up to {crop.maxStorageDays} days
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Chamber Link */}
              <div className="pt-3 border-t border-slate-800/80">
                {activeChambers.length > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Currently stored in:
                    </span>
                    <div className="flex gap-1.5">
                      {activeChambers.map(ch => (
                        <button
                          key={ch.id}
                          onClick={() => onSelectChamber(ch.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                            ch.status.startsWith("CRITICAL")
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
                          }`}
                        >
                          {ch.id} ({ch.currentTemp.toFixed(1)}°C)
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Default Assignment:</span>
                    <span className="font-mono text-slate-400">{crop.recommendedChamber}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
