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

  // Sparkline calculations
  const history = chamber.history || [chamber.currentTemp];
  const minHist = Math.min(...history) - 0.5;
  const maxHist = Math.max(...history) + 0.5;
  const range = maxHist - minHist || 1;
  const svgWidth = 120;
  const svgHeight = 24;

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
    <div className={`aww-card rounded-2xl p-5.5 flex flex-col justify-between transition-all duration-300 relative ${
      isCritical
        ? "border-[#eab308] bg-[#0f1115] shadow-xl shadow-yellow-950/20 aww-card-yellow"
        : isWarning
        ? "border-yellow-500/50 bg-[#0f1115]"
        : isDefrost
        ? "border-white/30 bg-[#0f1115]"
        : "border-white/10 hover:border-white/20"
    }`}>
      <div>
        {/* Vault Header & Monospace ID */}
        <div className="flex items-start justify-between gap-2 mb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="aww-tag text-[10px] font-bold px-2 py-0.5 rounded bg-white text-black">
                {chamber.id}
              </span>
              <h3 className="text-base font-bold text-white font-heading tracking-tight">
                {chamber.name.replace(/^Chamber \d+ - /, "")}
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5 font-mono">
              <span className="text-neutral-500">CROP:</span>
              <span className="text-white font-medium">{chamber.cropType}</span>
            </p>
          </div>

          {/* Minimalist Status Badge */}
          <div>
            {isCritical ? (
              <span className="aww-tag text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#eab308] bg-[#eab308]/15 text-[#eab308] animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> THRESHOLD BREACH
              </span>
            ) : isWarning ? (
              <span className="aww-tag text-[10px] font-bold px-2.5 py-1 rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> TEMP DRIFT
              </span>
            ) : isDefrost ? (
              <span className="aww-tag text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/40 bg-white/10 text-white flex items-center gap-1">
                <Flame className="w-3 h-3" /> DEFROST ACTIVE
              </span>
            ) : (
              <span className="aww-tag text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> OPTIMAL
              </span>
            )}
          </div>
        </div>

        {/* Telemetry Block */}
        <div className="grid grid-cols-2 gap-3.5 p-4 rounded-xl bg-[#08090b] border border-white/5 mb-4">
          {/* Temperature */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span className="flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-white" /> TEMP
              </span>
              <span className="text-neutral-500 text-[10px]">
                SET {chamber.targetTemp}°C
              </span>
            </div>

            <div className="flex items-baseline gap-1 mt-1.5">
              <span className={`text-3xl font-black font-mono tracking-tight ${
                isCritical ? "text-[#eab308]" : isWarning ? "text-yellow-400" : "text-white"
              }`}>
                {chamber.currentTemp.toFixed(1)}
              </span>
              <span className="text-xs font-mono font-medium text-neutral-400">°C</span>
            </div>

            {/* Sparkline in monochrome/yellow/green */}
            <div className="mt-2 flex items-center justify-between">
              <svg width={svgWidth} height={svgHeight} className="overflow-visible">
                <polyline
                  fill="none"
                  stroke={isCritical ? "#eab308" : isWarning ? "#facc15" : "#22c55e"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
              </svg>
              <span className="text-[9px] font-mono text-neutral-500">20t</span>
            </div>

            {matchedCrop && (
              <span className="text-[10px] font-mono text-neutral-400 mt-1.5">
                Safe: <span className="text-white">{matchedCrop.idealTempMin}°C – {matchedCrop.idealTempMax}°C</span>
              </span>
            )}
          </div>

          {/* Humidity & Diagnostics */}
          <div className="flex flex-col border-l border-white/10 pl-3.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-white" /> HUMIDITY
              </span>
              <span className="text-neutral-500 text-[10px]">
                SET {chamber.targetHumidity}%
              </span>
            </div>

            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {chamber.currentHumidity.toFixed(1)}
              </span>
              <span className="text-xs font-mono font-medium text-neutral-400">%</span>
            </div>

            <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
              <span className="text-neutral-400 flex items-center gap-1">
                <Wind className="w-3 h-3 text-neutral-400" /> ETHYLENE:
              </span>
              <span className="text-white font-medium">
                {chamber.currentEthylene ? `${chamber.currentEthylene.toFixed(2)} ppm` : "N/A"}
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
              <span className="text-neutral-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-neutral-400" /> CHILLER:
              </span>
              <span className={chamber.compressorRunning ? "text-[#22c55e] font-semibold" : "text-neutral-500"}>
                {chamber.compressorRunning ? "RUNNING" : "STANDBY"}
              </span>
            </div>
          </div>
        </div>

        {/* Capacity Indicator */}
        <div className="p-3.5 rounded-xl bg-[#08090b] border border-white/5 mb-4">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-neutral-300 flex items-center gap-1.5 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-white" /> CAPACITY USAGE:
            </span>
            <span className="text-white font-bold text-xs">
              {chamber.usedMT} / {chamber.capacityMT} MT
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                occupancyPercent > 85 ? "bg-[#eab308]" : "bg-white"
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#22c55e]">
              {freeSpaceMT} MT VACANT ({100 - occupancyPercent}%)
            </span>
            <button
              onClick={() => setShowRacks(!showRacks)}
              className="text-neutral-400 hover:text-white underline cursor-pointer transition-colors"
            >
              {showRacks ? "HIDE RACKS" : "EXPAND RACKS"}
            </button>
          </div>

          {/* Racks Layout */}
          {showRacks && (
            <div className="mt-2.5 pt-2.5 border-t border-white/10 grid grid-cols-2 gap-2">
              {chamber.racks.map(rack => (
                <div
                  key={rack.id}
                  className={`p-2 rounded-lg text-xs font-mono border flex flex-col justify-between ${
                    rack.occupied
                      ? "bg-white/5 border-white/15 text-white"
                      : "bg-transparent border-white/5 text-neutral-600"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span>{rack.id}</span>
                    <span className={rack.occupied ? "text-[#22c55e]" : ""}>
                      {rack.occupied ? `${rack.weightMT} MT` : "EMPTY"}
                    </span>
                  </div>
                  {rack.occupied && (
                    <div className="text-[9px] text-neutral-400 truncate mt-1">
                      {rack.farmer || rack.batchId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Target Setpoints Drawer */}
      {showSettings && (
        <form onSubmit={handleSaveSettings} className="p-3 mb-3 rounded-xl bg-black border border-white/20 animate-fade-in font-mono text-xs">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/10">
            <span className="text-xs font-bold text-white">CALIBRATE SETPOINTS</span>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <div>
              <label className="text-[10px] text-neutral-400 block mb-0.5">TARGET TEMP (°C)</label>
              <input
                type="number"
                step="0.5"
                value={targetTempInput}
                onChange={e => setTargetTempInput(e.target.value)}
                className="w-full px-2 py-1 text-xs rounded bg-[#121518] border border-white/15 text-white outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 block mb-0.5">TARGET HUMIDITY (%)</label>
              <input
                type="number"
                step="1"
                value={targetHumInput}
                onChange={e => setTargetHumInput(e.target.value)}
                className="w-full px-2 py-1 text-xs rounded bg-[#121518] border border-white/15 text-white outline-none focus:border-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-1 text-xs font-bold rounded bg-white hover:bg-neutral-200 text-black cursor-pointer transition-all"
          >
            CONFIRM SETPOINTS
          </button>
        </form>
      )}

      {/* Action Toolbar */}
      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-1.5 font-mono">
        {/* Toggle Door */}
        <button
          onClick={() => onToggleDoor(chamber.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            chamber.doorOpen
              ? "bg-[#eab308]/20 border-[#eab308] text-[#eab308] animate-pulse"
              : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          {chamber.doorOpen ? <DoorOpen className="w-3.5 h-3.5 text-[#eab308]" /> : <DoorClosed className="w-3.5 h-3.5 text-neutral-400" />}
          <span>{chamber.doorOpen ? "HATCH OPEN" : "SEALED"}</span>
        </button>

        {/* Defrost */}
        <button
          onClick={() => onTriggerDefrost(chamber.id)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            chamber.defrostActive
              ? "bg-white text-black font-bold"
              : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>DEFROST</span>
        </button>

        {/* Spike Temp Simulation */}
        <button
          onClick={() => onSpikeTemp(chamber.id, chamber.currentTemp > 4 ? 14.5 : 6.8)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[#eab308]/40 bg-[#eab308]/10 text-[#eab308] hover:bg-[#eab308]/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>SPIKE</span>
        </button>

        {/* Reset */}
        {(isCritical || isWarning || chamber.doorOpen || chamber.defrostActive) && (
          <button
            onClick={() => onResetChamber(chamber.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e] hover:bg-[#22c55e]/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        )}

        {/* Settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
          title="Chamber Settings"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
