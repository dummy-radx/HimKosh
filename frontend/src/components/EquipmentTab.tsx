import React from "react";
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw
} from "lucide-react";
import { EquipmentItem } from "../types";

interface EquipmentTabProps {
  equipment: EquipmentItem[];
  onServiceEquipment: (id: string) => Promise<void>;
}

export const EquipmentTab: React.FC<EquipmentTabProps> = ({
  equipment,
  onServiceEquipment
}) => {
  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="aww-card rounded-2xl p-6 bg-white border border-neutral-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="aww-tag text-[10px] text-neutral-500 font-bold">
              MACHINERY // 01 · PLANT HEALTH
            </span>
          </div>
          <h2 className="text-2xl font-black text-black font-heading tracking-tight">
            REFRIGERATION MACHINERY & PREDICTIVE MAINTENANCE
          </h2>
          <p className="text-xs text-neutral-600 mt-0.5">
            Real-time Bitzer screw suction/discharge pressures, vibration telemetry, and preventive servicing intervals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            COMPRESSOR RACKS NOMINAL
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {equipment.map((eq) => {
          const isWarning = eq.status === "ATTENTION_SOON";
          const isCritical = eq.status === "CRITICAL";

          return (
            <div
              key={eq.id}
              className={`aww-card rounded-2xl p-5.5 bg-white flex flex-col justify-between transition-all shadow-xs hover:shadow-md ${
                isCritical
                  ? "border-amber-300 bg-amber-50/70"
                  : isWarning
                  ? "border-amber-200 bg-amber-50/40"
                  : "border-neutral-200"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="aww-tag text-[9px] font-bold px-2 py-0.5 rounded bg-black text-white">
                      {eq.id}
                    </span>
                    <h3 className="text-sm font-bold text-black mt-1.5 font-heading">
                      {eq.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-medium">TYPE: {eq.type}</p>
                  </div>

                  {isCritical ? (
                    <span className="aww-tag text-[9px] font-bold px-2 py-0.5 rounded border border-amber-400 bg-amber-100 text-amber-900 animate-pulse flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> OVERDUE
                    </span>
                  ) : isWarning ? (
                    <span className="aww-tag text-[9px] font-bold px-2 py-0.5 rounded border border-amber-300 bg-amber-100 text-amber-900 flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> DUE {eq.nextServiceDueDays}d
                    </span>
                  ) : (
                    <span className="aww-tag text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> OPTIMAL
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-neutral-600 mb-3 flex items-center gap-1 font-medium">
                  <span className="text-neutral-500">COVERAGE:</span>
                  <span className="text-black font-semibold">{eq.chamberCoverage.join(", ")}</span>
                </div>

                {/* Telemetry Metrics */}
                <div className="space-y-2 text-xs mb-4">
                  {eq.suctionPressurePsi !== undefined && (
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-neutral-500 font-semibold block">SUCTION PRESS</span>
                        <span className="font-bold text-black">{eq.suctionPressurePsi} PSI</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 font-semibold block">DISCHARGE PRESS</span>
                        <span className="font-bold text-amber-800">{eq.dischargePressurePsi} PSI</span>
                      </div>
                    </div>
                  )}

                  {eq.motorVibrationMmS !== undefined && (
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-neutral-500 font-semibold block">VIBRATION</span>
                        <span className={`font-bold ${eq.motorVibrationMmS > 2.0 ? "text-amber-800" : "text-emerald-700"}`}>
                          {eq.motorVibrationMmS} mm/s
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 font-semibold block">OIL LEVEL</span>
                        <span className="font-bold text-black">{eq.oilLevelPercent}%</span>
                      </div>
                    </div>
                  )}

                  {eq.airFlowCfm !== undefined && (
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex justify-between">
                      <span className="text-neutral-500 font-semibold">AIRFLOW:</span>
                      <span className="text-black font-bold">{eq.airFlowCfm?.toLocaleString() ?? 0} CFM</span>
                    </div>
                  )}

                  {eq.scaleWarning && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span>{eq.scaleWarning}</span>
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" /> TOTAL HOURS:
                    </span>
                    <span className="font-bold text-black">
                      {(eq.runHoursTotal ?? 0).toLocaleString()} hrs
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-600 italic bg-neutral-50 p-2 rounded-lg border border-neutral-200 mb-3 font-sans">
                  "{eq.notes}"
                </p>
              </div>

              {/* Service Action Button */}
              <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-[10px] text-neutral-500 font-medium">
                  SERVICED: {eq.lastMaintenanceDate}
                </span>

                <button
                  onClick={() => onServiceEquipment(eq.id)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-neutral-300 bg-white hover:bg-black hover:text-white text-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>LOG SERVICE</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
