import React from "react";
import { 
  Sliders, 
  Sparkles, 
  DoorOpen, 
  Flame, 
  Zap, 
  RefreshCw, 
  X, 
  AlertTriangle,
  Play
} from "lucide-react";

interface SimulationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleDoor: (chamberId: string) => void;
  onSpikeTemp: (chamberId: string, temp: number) => void;
  onTriggerDefrost: (chamberId: string) => void;
  onSetPowerMode: (mode: string) => void;
  onResetChamber: (chamberId: string) => void;
}

export const SimulationDrawer: React.FC<SimulationDrawerProps> = ({
  isOpen,
  onClose,
  onToggleDoor,
  onSpikeTemp,
  onTriggerDefrost,
  onSetPowerMode,
  onResetChamber
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#0a0f1d] border-l border-white/10 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-left">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Interactive Simulation Control
                </h3>
                <p className="text-xs text-slate-400">
                  Trigger mock IoT sensor events and evaluate automated threshold alarms.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scenarios */}
          <div className="space-y-4">
            {/* Scenario 1: Door Left Ajar */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="flex items-center gap-2 mb-1">
                <DoorOpen className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">Chamber 1 Door Breach</h4>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Simulates loading bay hatch left unsealed. Ambient heat inflates chamber temperature and sounds door alarm.
              </p>
              <button
                onClick={() => {
                  onToggleDoor("CH-1");
                }}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> Toggle Door Open/Close (CH-1)
              </button>
            </div>

            {/* Scenario 2: Crop Temperature Breach */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 transition-all">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-bold text-white">Crop Threshold Temperature Spike</h4>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Simulates chiller trip in Chamber 3 (Strawberries). Temp spikes to 6.5°C, instantly exceeding the 3.5°C crop safety limit.
              </p>
              <button
                onClick={() => {
                  onSpikeTemp("CH-3", 6.8);
                }}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Spike Chamber 3 Temp (+6.8°C)
              </button>
            </div>

            {/* Scenario 3: Grid Outage / Switch to Battery BESS */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white">Grid Blackout & BESS Transfer</h4>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Simulates external utility grid failure. The microgrid smoothly fails over to the 240 kWh Battery Storage Bank.
              </p>
              <button
                onClick={() => {
                  onSetPowerMode("BATTERY_BACKUP");
                }}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" /> Switch to Emergency Battery BESS
              </button>
            </div>

            {/* Scenario 4: Defrost Cycle */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-all">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold text-white">Deep Freeze Defrosting</h4>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Activates coil heater elements in Chamber 5 to eliminate ice buildup on evaporator fins.
              </p>
              <button
                onClick={() => {
                  onTriggerDefrost("CH-5");
                }}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5" /> Trigger Defrost (CH-5)
              </button>
            </div>
          </div>
        </div>

        {/* Global Reset */}
        <div className="pt-4 border-t border-slate-800 mt-6">
          <button
            onClick={() => {
              ["CH-1", "CH-2", "CH-3", "CH-4", "CH-5"].forEach(id => onResetChamber(id));
              onSetPowerMode("SOLAR_HYBRID");
            }}
            className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Reset All Chambers to Optimal Safe State
          </button>
        </div>
      </div>
    </div>
  );
};
