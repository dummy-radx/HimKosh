import React from "react";
import { 
  SlidersHorizontal, 
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end font-mono">
      <div className="w-full max-w-md bg-white border-l border-neutral-300 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
                <SlidersHorizontal className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-black font-heading tracking-tight">
                  SIMULATION CONTROLS
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Trigger mock IoT events and verify safety thresholds.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-black p-1 rounded-lg border border-neutral-200 bg-neutral-50 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scenarios */}
          <div className="space-y-4 text-xs">
            {/* Scenario 1: Door Open */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-neutral-400 transition-all">
              <div className="flex items-center gap-2 mb-1">
                <DoorOpen className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-black">CH-1 DOOR BREACH</h4>
              </div>
              <p className="text-[11px] text-neutral-600 mb-3 font-sans">
                Simulates hatch unsealed. Ambient heat inflates chamber temperature and sounds door alarm.
              </p>
              <button
                onClick={() => onToggleDoor("CH-1")}
                className="w-full py-2 px-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Play className="w-3.5 h-3.5" /> TOGGLE DOOR OPEN/CLOSE (CH-1)
              </button>
            </div>

            {/* Scenario 2: Crop Threshold Temp Spike */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-neutral-400 transition-all">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-black">CROP THRESHOLD TEMPERATURE SPIKE</h4>
              </div>
              <p className="text-[11px] text-neutral-600 mb-3 font-sans">
                Spikes Chamber 3 (Strawberries) to +6.8°C, instantly exceeding the safe crop threshold (3.5°C).
              </p>
              <button
                onClick={() => onSpikeTemp("CH-3", 6.8)}
                className="w-full py-2 px-3 rounded-lg border border-amber-400 bg-amber-400 text-black hover:bg-amber-500 font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" /> SPIKE CH-3 TEMP (+6.8°C)
              </button>
            </div>

            {/* Scenario 3: Grid Blackout / BESS */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-neutral-400 transition-all">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-black">GRID BLACKOUT & BESS TRANSFER</h4>
              </div>
              <p className="text-[11px] text-neutral-600 mb-3 font-sans">
                Cuts external utility feed; auto-failover transfers compressors to 240 kWh Battery Storage.
              </p>
              <button
                onClick={() => onSetPowerMode("BATTERY_BACKUP")}
                className="w-full py-2 px-3 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5" /> SWITCH TO BESS BATTERY
              </button>
            </div>

            {/* Scenario 4: Defrost */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-neutral-400 transition-all">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-black" />
                <h4 className="font-bold text-black">DEEP FREEZE DEFROST CYCLE</h4>
              </div>
              <p className="text-[11px] text-neutral-600 mb-3 font-sans">
                Activates coil defrost heaters in Chamber 5 to eliminate ice buildup on evaporator fins.
              </p>
              <button
                onClick={() => onTriggerDefrost("CH-5")}
                className="w-full py-2 px-3 rounded-lg border border-neutral-300 bg-white text-black hover:bg-black hover:text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all"
              >
                <Flame className="w-3.5 h-3.5" /> TRIGGER DEFROST (CH-5)
              </button>
            </div>
          </div>
        </div>

        {/* Global Reset */}
        <div className="pt-4 border-t border-neutral-200 mt-6">
          <button
            onClick={() => {
              ["CH-1", "CH-2", "CH-3", "CH-4", "CH-5"].forEach(id => onResetChamber(id));
              onSetPowerMode("SOLAR_HYBRID");
            }}
            className="w-full py-3 px-4 rounded-xl bg-black text-white font-bold text-xs hover:bg-neutral-800 shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <RefreshCw className="w-4 h-4" /> RESET ALL CHAMBERS TO SAFE STATE
          </button>
        </div>
      </div>
    </div>
  );
};
