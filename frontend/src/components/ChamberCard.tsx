import React, { useState } from "react";
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  DoorClosed, 
  DoorOpen, 
  Activity, 
  Flame, 
  RefreshCw, 
  Settings2, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  Sparkles
} from "lucide-react";
import { Chamber, CropGuideline } from "../types";

interface ChamberCardProps {
  chamber: Chamber;
  crops: CropGuideline[];
  onToggleDoor: (chamberId: string) => void;
  onSpikeTemp: (chamberId: string, temp: number) => void;
  onTriggerDefrost: (chamberId: string) => void;
  onResetChamber: (chamberId: string) => void;
  onUpdateTarget: (chamberId: string, temp: number, humidity: number) => void;
}

export const ChamberCard: React.FC<ChamberCardProps> = ({
  chamber,
  crops,
  onToggleDoor,
  onSpikeTemp,
  onTriggerDefrost,
  onResetChamber,
  onUpdateTarget
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [targetTempInput, setTargetTempInput] = useState(chamber.targetTemp.toString());
  const [targetHumInput, setTargetHumInput] = useState(chamber.targetHumidity.toString());
  const [showRacks, setShowRacks] = useState(false);

  const matchedCrop = crops.find(c => c.id === chamber.cropId);

  const isCritical = chamber.status === "CRITICAL_HIGH" || chamber.status === "CRITICAL_LOW";
  const isWarning = chamber.status === "WARNING";
  const isDefrost = chamber.status === "DEFROSTING";

  // Calculate mini sparkline path
  const history = chamber.history || [chamber.currentTemp];
  const minHist = Math.min(...history) - 0.5;
  const maxHist = Math.max(...history) + 0.5;
  const range = maxHist - minHist || 1;
  const svgWidth = 120;
  const svgHeight = 28;

  const points = history.map((val, index) => {
    const x = (index / (history.length - 1 || 1)) * svgWidth;
    const y = svgHeight - ((val - minHist) / range) * svgHeight;
    return `${x},${y}`;
  }).join(" ");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTarget(chamber.id, parseFloat(targetTempInput), parseFloat(targetHumInput));
    setShowSettings(false);
  };

  const freeSpaceMT = Math.max(0, Math.round((chamber.capacityMT - chamber.usedMT) * 10) / 10);
  const occupancyPercent = Math.min(100, Math.round((chamber.usedMT / chamber.capacityMT) * 100));

  return (
    <div className={`glass-panel rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
      isCritical
        ? "border-rose-500/80 bg-rose-950/20 shadow-xl shadow-rose-950/40 glow-rose"
        : isWarning
        ? "border-amber-500/60 bg-amber-950/15 shadow-lg shadow-amber-950/30"
        : isDefrost
        ? "border-blue-500/60 bg-blue-950/20"
        : "border-white/10 hover:border-cyan-500/30 hover:shadow-cyan-950/20"
    }`}>
      {/* Header Info */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded-md">
                {chamber.id}
              </span>
              <h3 className="text-base font-bold text-white tracking-wide font-heading">
                {chamber.name}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Produce:</span>
              <span className="text-slate-200 font-medium">{chamber.cropType}</span>
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5">
            {isCritical ? (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                <AlertTriangle className="w-3 h-3" /> Critical Breach
              </span>
            ) : isWarning ? (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <AlertTriangle className="w-3 h-3" /> Temp Drift
              </span>
            ) : isDefrost ? (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                <Flame className="w-3 h-3" /> Defrost Cycle
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Optimal
              </span>
            )}
          </div>
        </div>

        {/* Primary Telemetry Gauges (Temperature & Humidity) */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 mb-3.5">
          {/* Temperature */}
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" /> Temperature
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                Set: {chamber.targetTemp}°C
              </span>
            </span>

            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-3xl font-extrabold font-mono tracking-tight ${
                isCritical ? "text-rose-400" : isWarning ? "text-amber-400" : "text-white"
              }`}>
                {chamber.currentTemp.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-slate-400">°C</span>
            </div>

            {/* Sparkline */}
            <div className="mt-1 flex items-center justify-between">
              <svg width={svgWidth} height={svgHeight} className="overflow-visible">
                <polyline
                  fill="none"
                  stroke={isCritical ? "#f43f5e" : isWarning ? "#f59e0b" : "#06b6d4"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
              </svg>
              <span className="text-[10px] text-slate-500 font-mono">20-tick</span>
            </div>

            {/* Crop limit reference */}
            {matchedCrop && (
              <span className="text-[10px] text-slate-400 mt-1">
                Safe window: <span className="text-cyan-300">{matchedCrop.idealTempMin}°C to {matchedCrop.idealTempMax}°C</span>
              </span>
            )}
          </div>

          {/* Humidity & Ethylene */}
          <div className="flex flex-col border-l border-slate-800 pl-3">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" /> Humidity
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                Set: {chamber.targetHumidity}%
              </span>
            </span>

            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                {chamber.currentHumidity.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-slate-400">%</span>
            </div>

            {/* Ethylene gas ppm */}
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Wind className="w-3 h-3 text-purple-400" /> Ethylene:
              </span>
              <span className="font-mono font-medium text-slate-200">
                {chamber.currentEthylene ? `${chamber.currentEthylene.toFixed(2)} ppm` : "N/A"}
              </span>
            </div>

            {/* Door & Compressor Status */}
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-teal-400" /> Chiller:
              </span>
              <span className={`font-medium ${chamber.compressorRunning ? "text-emerald-400" : "text-slate-400"}`}>
                {chamber.compressorRunning ? "Active Run" : "Idle Cycle"}
              </span>
            </div>
          </div>
        </div>

        {/* Capacity & Space Indicator */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 mb-3.5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Storage Capacity:
            </span>
            <span className="font-mono text-slate-200 font-semibold">
              {chamber.usedMT} / {chamber.capacityMT} MT
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-1.5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                occupancyPercent > 90
                  ? "bg-rose-500"
                  : occupancyPercent > 75
                  ? "bg-amber-400"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500"
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-medium">
              {freeSpaceMT} MT Space Free ({100 - occupancyPercent}%)
            </span>
            <button
              onClick={() => setShowRacks(!showRacks)}
              className="text-cyan-400 hover:text-cyan-300 text-[11px] underline cursor-pointer"
            >
              {showRacks ? "Hide Racks" : "View Racks"}
            </button>
          </div>

          {/* Collapsible Rack Slot Visualizer */}
          {showRacks && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2">
              {chamber.racks.map(rack => (
                <div
                  key={rack.id}
                  className={`p-2 rounded-lg text-xs border flex flex-col justify-between ${
                    rack.occupied
                      ? "bg-cyan-950/30 border-cyan-800/50 text-cyan-200"
                      : "bg-slate-800/30 border-slate-700/40 text-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold text-[10px]">
                    <span>{rack.id}</span>
                    <span>{rack.occupied ? `${rack.weightMT} MT` : "EMPTY"}</span>
                  </div>
                  {rack.occupied && (
                    <div className="text-[10px] text-slate-300 truncate mt-1">
                      {rack.farmer || rack.batchId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Target Setpoint Edit Drawer */}
      {showSettings && (
        <form onSubmit={handleSaveSettings} className="p-3 mb-3 rounded-xl bg-slate-900 border border-cyan-500/40 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white">Adjust Chamber Setpoints</span>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Target Temp (°C)</label>
              <input
                type="number"
                step="0.5"
                value={targetTempInput}
                onChange={e => setTargetTempInput(e.target.value)}
                className="w-full px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-white font-mono focus:border-cyan-400 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Target Humidity (%)</label>
              <input
                type="number"
                step="1"
                value={targetHumInput}
                onChange={e => setTargetHumInput(e.target.value)}
                className="w-full px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-white font-mono focus:border-cyan-400 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-1 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer"
            >
              Apply Changes
            </button>
          </div>
        </form>
      )}

      {/* Action / Simulation Toolbar */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1.5">
        {/* Toggle Door */}
        <button
          onClick={() => onToggleDoor(chamber.id)}
          title={chamber.doorOpen ? "Seal Chamber Door" : "Simulate Chamber Door Left Open"}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            chamber.doorOpen
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 animate-pulse"
              : "bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white"
          }`}
        >
          {chamber.doorOpen ? <DoorOpen className="w-3.5 h-3.5 text-rose-400" /> : <DoorClosed className="w-3.5 h-3.5 text-slate-400" />}
          <span>{chamber.doorOpen ? "Hatch Ajar" : "Door Sealed"}</span>
        </button>

        {/* Defrost Button */}
        <button
          onClick={() => onTriggerDefrost(chamber.id)}
          title="Toggle Electric Coil Defrost"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            chamber.defrostActive
              ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
              : "bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-blue-400" />
          <span>Defrost</span>
        </button>

        {/* Spike Temp Simulation */}
        <button
          onClick={() => onSpikeTemp(chamber.id, chamber.currentTemp > 4 ? 15.0 : 6.8)}
          title="Simulate sudden thermal malfunction / crop threshold breach"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Sim Spike</span>
        </button>

        {/* Reset / Calibrate */}
        {(isCritical || isWarning || chamber.doorOpen || chamber.defrostActive) && (
          <button
            onClick={() => onResetChamber(chamber.id)}
            title="Calibrate and restore optimal target conditions"
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reset</span>
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          title="Chamber Setpoints"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition-all cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
