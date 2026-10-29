import React from "react";
import { 
  Leaf, 
  Thermometer, 
  Droplets, 
  Wind, 
  Calendar, 
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
    <div className="space-y-6 font-mono">
      {/* Intro Header */}
      <div className="aww-card rounded-2xl p-6 bg-white border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
            <Leaf className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-black font-heading tracking-tight">
              CROP CLIMATE THRESHOLDS & SPECIFICATIONS
            </h2>
            <p className="text-xs text-neutral-500 font-mono mt-0.5">
              Agronomic post-harvest standards. Automated HVAC alerts trigger when vaults drift beyond critical limits.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {crops.map((crop) => {
          const activeChambers = chambers.filter(c => c.cropId === crop.id);

          return (
            <div 
              key={crop.id}
              className="aww-card rounded-2xl p-5.5 bg-white border border-neutral-200 flex flex-col justify-between shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="aww-tag text-[9px] font-bold px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700">
                      {crop.category}
                    </span>
                    <h3 className="text-base font-bold text-black mt-1.5 font-heading">
                      {crop.name}
                    </h3>
                  </div>

                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ${crop.storageFeePerTonPerDay}/MT/d
                  </span>
                </div>

                {/* Parameters */}
                <div className="space-y-2 my-4 text-xs font-mono">
                  {/* Optimal Window */}
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <span className="text-neutral-600 flex items-center gap-1.5 font-medium">
                      <Thermometer className="w-3.5 h-3.5 text-black" /> OPTIMAL TEMP:
                    </span>
                    <span className="font-bold text-emerald-700">
                      {crop.idealTempMin}°C TO {crop.idealTempMax}°C
                    </span>
                  </div>

                  {/* Threshold Breach Warning */}
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <span className="text-amber-800 flex items-center gap-1.5 text-[11px] font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> CRITICAL TRIGGER:
                    </span>
                    <span className="font-bold text-amber-900 text-[11px]">
                      &gt; {crop.maxSafeTemp}°C OR &lt; {crop.minSafeTemp}°C
                    </span>
                  </div>

                  {/* Humidity */}
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <span className="text-neutral-600 flex items-center gap-1.5 font-medium">
                      <Droplets className="w-3.5 h-3.5 text-black" /> TARGET HUMIDITY:
                    </span>
                    <span className="font-bold text-black">
                      {crop.idealHumidityMin}% – {crop.idealHumidityMax}% RH
                    </span>
                  </div>

                  {/* Ethylene */}
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <span className="text-neutral-600 flex items-center gap-1.5 font-medium">
                      <Wind className="w-3.5 h-3.5 text-black" /> MAX ETHYLENE:
                    </span>
                    <span className="font-bold text-black">
                      &le; {crop.maxEthylenePpm} ppm
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <span className="text-neutral-600 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-black" /> STORAGE LIFE:
                    </span>
                    <span className="font-bold text-black">
                      UP TO {crop.maxStorageDays} DAYS
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned Chambers */}
              <div className="pt-3 border-t border-neutral-100 font-mono text-[11px]">
                {activeChambers.length > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">ASSIGNED VAULTS:</span>
                    <div className="flex gap-1.5">
                      {activeChambers.map(ch => (
                        <button
                          key={ch.id}
                          onClick={() => onSelectChamber(ch.id)}
                          className="px-2 py-0.5 rounded text-[10px] font-bold border border-neutral-300 bg-neutral-100 text-black hover:bg-black hover:text-white transition-all cursor-pointer"
                        >
                          {ch.id} ({ch.currentTemp.toFixed(1)}°C)
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>RECOMMENDED:</span>
                    <span className="text-black font-bold">{crop.recommendedChamber}</span>
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
