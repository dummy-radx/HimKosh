import React from "react";
import { 
  Wrench, 
  Cpu, 
  Activity, 
  Gauge, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  RefreshCw,
  Wind,
  ShieldCheck,
  Zap
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">
              Refrigeration Plant Machinery & Predictive Maintenance
            </h2>
            <p className="text-xs text-slate-400">
              Live vibration telemetry, refrigerant suction/discharge pressures, and automated preventative servicing schedules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Plant Status:</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> All Compressors Operational
          </span>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {equipment.map((eq) => {
          const isWarning = eq.status === "ATTENTION_SOON";
          const isCritical = eq.status === "CRITICAL";

          return (
            <div
              key={eq.id}
              className={`glass-panel rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isCritical
                  ? "border-rose-500/60 bg-rose-950/20 glow-rose"
                  : isWarning
                  ? "border-amber-500/50 bg-amber-950/15"
                  : "border-white/10 hover:border-cyan-500/30"
              }`}
            >
              <div>
                {/* Title & Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
                      {eq.id}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5 font-heading">
                      {eq.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">Type: {eq.type}</p>
                  </div>

                  {isCritical ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> Service Due
                    </span>
                  ) : isWarning ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> Due in {eq.nextServiceDueDays}d
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Nominal
                    </span>
                  )}
                </div>

                {/* Chamber Coverage */}
                <div className="text-[11px] text-slate-400 mb-3 flex items-center gap-1">
                  <span>Coverage:</span>
                  <span className="text-slate-200 font-medium">
                    {eq.chamberCoverage.join(", ")}
                  </span>
                </div>

                {/* Telemetry Metrics */}
                <div className="space-y-2 text-xs mb-4">
                  {/* Suction & Discharge Pressures for Compressors */}
                  {eq.suctionPressurePsi !== undefined && (
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-2 gap-2 font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Suction Press.</span>
                        <span className="font-bold text-cyan-300">{eq.suctionPressurePsi} PSI</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Discharge Press.</span>
                        <span className="font-bold text-amber-300">{eq.dischargePressurePsi} PSI</span>
                      </div>
                    </div>
                  )}

                  {/* Vibration & Oil Level */}
                  {eq.motorVibrationMmS !== undefined && (
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-2 gap-2 font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Vibration</span>
                        <span className={`font-bold ${eq.motorVibrationMmS > 2.0 ? "text-amber-400" : "text-emerald-400"}`}>
                          {eq.motorVibrationMmS} mm/s
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Oil Level</span>
                        <span className="font-bold text-white">{eq.oilLevelPercent}%</span>
                      </div>
                    </div>
                  )}

                  {/* Fan Airflow / Special Attributes */}
                  {eq.airFlowCfm && (
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between font-mono">
                      <span className="text-slate-400">Airflow:</span>
                      <span className="text-white font-bold">{eq.airFlowCfm.toLocaleString()} CFM</span>
                    </div>
                  )}

                  {eq.scaleWarning && (
                    <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-[11px] text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{eq.scaleWarning}</span>
                    </div>
                  )}

                  {/* Run Hours Counter */}
                  <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-cyan-400" /> Total Run Time:
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      {eq.runHoursTotal.toLocaleString()} hrs
                    </span>
                  </div>
                </div>

                {/* Tech Log Notes */}
                <p className="text-[11px] text-slate-400 italic bg-slate-900/30 p-2 rounded-lg border border-slate-800/50 mb-3">
                  "{eq.notes}"
                </p>
              </div>

              {/* Service Action Button */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Last Maint: {eq.lastMaintenanceDate}
                </span>

                <button
                  onClick={() => onServiceEquipment(eq.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Log Service</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
