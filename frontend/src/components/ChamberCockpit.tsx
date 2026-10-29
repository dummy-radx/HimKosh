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
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  Sliders
} from "lucide-react";
import { Chamber, CropGuideline, AlertItem, PowerState } from "../types";

interface ChamberCockpitProps {
  chambers: Chamber[];
  crops: CropGuideline[];
  power: PowerState;
  alerts: AlertItem[];
  onToggleDoor: (chamberId: string) => void;
  onSpikeTemp: (chamberId: string, temp: number) => void;
  onTriggerDefrost: (chamberId: string) => void;
  onResetChamber: (chamberId: string) => void;
  onUpdateTarget: (chamberId: string, temp: number, humidity: number) => void;
  onResolveAlert: (id: string) => void;
}

export const ChamberCockpit: React.FC<ChamberCockpitProps> = ({
  chambers,
  crops,
  alerts,
  onToggleDoor,
  onSpikeTemp,
  onTriggerDefrost,
  onResetChamber,
  onUpdateTarget,
  onResolveAlert
}) => {
  const [selectedChamberId, setSelectedChamberId] = useState<string>("CH-1");
  const selectedChamber = chambers.find(c => c.id === selectedChamberId) || chambers[0];
  const matchedCrop = crops.find(c => c.id === selectedChamber?.cropId);

  // Calibration state
  const [calibTemp, setCalibTemp] = useState<string>(selectedChamber?.targetTemp.toString() || "1.0");
  const [calibHum, setCalibHum] = useState<string>(selectedChamber?.targetHumidity.toString() || "90.0");

  const handleSelectChamber = (id: string) => {
    setSelectedChamberId(id);
    const ch = chambers.find(c => c.id === id);
    if (ch) {
      setCalibTemp(ch.targetTemp.toString());
      setCalibHum(ch.targetHumidity.toString());
    }
  };

  const handleApplySetpoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChamber) {
      onUpdateTarget(selectedChamber.id, parseFloat(calibTemp), parseFloat(calibHum));
    }
  };

  // Sparkline calculations for selected chamber
  const history = selectedChamber?.history || [1.0];
  const minVal = Math.min(...history) - 0.5;
  const maxVal = Math.max(...history) + 0.5;
  const range = maxVal - minVal || 1;
  const svgWidth = 260;
  const svgHeight = 60;
  const points = history.map((val, idx) => {
    const x = (idx / (history.length - 1 || 1)) * svgWidth;
    const y = svgHeight - ((val - minVal) / range) * svgHeight;
    return `${x},${y}`;
  }).join(" ");

  const activeAlerts = alerts.filter(a => !a.resolved);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 font-mono">
      {/* LEFT/CENTER: Chamber Modules Matrix (7 Cols on XL) */}
      <div className="xl:col-span-7 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="aww-tag text-[10px] text-neutral-500 font-bold">
              VAULT MATRIX // 05 ACTIVE CELLS
            </span>
            <h2 className="text-xl font-black text-black font-heading tracking-tight mt-0.5">
              ENVIRONMENTAL CONTROL CELLS
            </h2>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">
            SELECT CARD TO INSPECT TELEMETRY
          </span>
        </div>

        {/* Chambers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {chambers.map((chamber) => {
            const isSelected = chamber.id === selectedChamberId;
            const isCritical = chamber.status.startsWith("CRITICAL");
            const isWarning = chamber.status === "WARNING";
            const isDefrost = chamber.status === "DEFROSTING";
            const occPct = Math.round((chamber.usedMT / chamber.capacityMT) * 100);

            return (
              <div
                key={chamber.id}
                onClick={() => handleSelectChamber(chamber.id)}
                className={`aww-card rounded-2xl p-4.5 cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
                  isSelected
                    ? "border-black ring-2 ring-black/15 shadow-md bg-white"
                    : isCritical
                    ? "border-amber-300 bg-amber-50/60 shadow-sm"
                    : "border-neutral-200 bg-white hover:border-neutral-400"
                }`}
              >
                <div>
                  {/* Top: ID, Crop & Status Tag */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          isSelected ? "bg-black text-white" : "bg-neutral-100 text-neutral-800 border border-neutral-200"
                        }`}>
                          {chamber.id}
                        </span>
                        <span className="font-heading font-bold text-sm text-black truncate max-w-[150px]">
                          {chamber.name.replace(/^Chamber \d+ - /, "")}
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5 font-medium">
                        {chamber.cropType.split("(")[0]}
                      </div>
                    </div>

                    {/* Status badge */}
                    {isCritical ? (
                      <span className="aww-tag text-[9px] font-bold px-2 py-0.5 rounded border border-amber-300 bg-amber-100 text-amber-900 animate-pulse">
                        BREACH
                      </span>
                    ) : isWarning ? (
                      <span className="aww-tag text-[9px] font-bold px-2 py-0.5 rounded border border-yellow-300 bg-yellow-100 text-yellow-900">
                        DRIFT
                      </span>
                    ) : isDefrost ? (
                      <span className="aww-tag text-[9px] font-bold px-2 py-0.5 rounded border border-neutral-300 bg-neutral-100 text-neutral-800">
                        DEFROST
                      </span>
                    ) : (
                      <span className="aww-tag text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-800">
                        OPTIMAL
                      </span>
                    )}
                  </div>

                  {/* Primary Numbers */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 mb-3">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-semibold block">TEMP</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className={`text-2xl font-black font-mono tracking-tight ${
                          isCritical ? "text-amber-800 font-black" : isWarning ? "text-yellow-800" : "text-black"
                        }`}>
                          {chamber.currentTemp.toFixed(1)}
                        </span>
                        <span className="text-xs text-neutral-500 font-semibold">°C</span>
                      </div>
                      <span className="text-[9px] text-neutral-400">
                        SET {chamber.targetTemp}°C
                      </span>
                    </div>

                    <div className="border-l border-neutral-200 pl-2.5">
                      <span className="text-[10px] text-neutral-500 font-semibold block">HUMIDITY</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-black font-mono text-black tracking-tight">
                          {chamber.currentHumidity.toFixed(1)}
                        </span>
                        <span className="text-xs text-neutral-500 font-semibold">%</span>
                      </div>
                      <span className="text-[9px] text-neutral-400">
                        SET {chamber.targetHumidity}%
                      </span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-neutral-500 mb-1 font-semibold">
                      <span>CAPACITY</span>
                      <span className="text-black font-bold">{chamber.usedMT} / {chamber.capacityMT} MT ({occPct}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-100 border border-neutral-200/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          occPct > 85 ? "bg-amber-500" : "bg-neutral-900"
                        }`}
                        style={{ width: `${occPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Actions Row */}
                <div 
                  className="pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-1 text-[10px]"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => onToggleDoor(chamber.id)}
                    className={`px-2 py-1 rounded border transition-all cursor-pointer font-bold ${
                      chamber.doorOpen
                        ? "border-amber-300 bg-amber-100 text-amber-900 animate-pulse"
                        : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {chamber.doorOpen ? "HATCH AJAR" : "SEALED"}
                  </button>

                  <button
                    onClick={() => onSpikeTemp(chamber.id, chamber.currentTemp > 4 ? 14.5 : 6.8)}
                    className="px-2 py-1 rounded border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-all cursor-pointer font-bold"
                    title="Simulate heat spike"
                  >
                    SPIKE
                  </button>

                  <button
                    onClick={() => onTriggerDefrost(chamber.id)}
                    className={`px-2 py-1 rounded border transition-all cursor-pointer ${
                      chamber.defrostActive
                        ? "bg-black text-white font-bold"
                        : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    DEFROST
                  </button>

                  {(isCritical || isWarning || chamber.doorOpen || chamber.defrostActive) && (
                    <button
                      onClick={() => onResetChamber(chamber.id)}
                      className="px-2 py-1 rounded border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer font-bold"
                    >
                      RESET
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Active Vault Inspector & Live Incident Terminal (5 Cols on XL) */}
      <div className="xl:col-span-5 space-y-4">
        {/* Selected Vault Telemetry Card */}
        <div className="aww-card rounded-2xl p-5 border-neutral-200 bg-white shadow-sm">
          <div className="flex items-start justify-between pb-3 border-b border-neutral-100 mb-4">
            <div>
              <span className="aww-tag text-[10px] text-neutral-500 font-bold">
                ACTIVE VAULT INSPECTOR
              </span>
              <h3 className="text-lg font-black text-black font-heading tracking-tight mt-0.5">
                {selectedChamber.name}
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                Crop: <span className="text-black font-bold">{selectedChamber.cropType}</span>
              </p>
            </div>

            <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-black text-white">
              {selectedChamber.id}
            </span>
          </div>

          {/* Thermal Waveform */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 mb-4">
            <div className="flex items-center justify-between text-[10px] text-neutral-500 font-semibold mb-2">
              <span>THERMAL WAVEFORM (LAST 20 TICKS)</span>
              <span className="text-black font-bold text-xs">{selectedChamber.currentTemp.toFixed(1)}°C</span>
            </div>

            <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="overflow-visible">
              <polyline
                fill="none"
                stroke={selectedChamber.status.startsWith("CRITICAL") ? "#ca8a04" : "#16a34a"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>

            {matchedCrop && (
              <div className="flex justify-between text-[10px] text-neutral-600 mt-2 pt-2 border-t border-neutral-200/60 font-mono">
                <span>SAFE BAND: <strong className="text-black">{matchedCrop.idealTempMin}°C TO {matchedCrop.idealTempMax}°C</strong></span>
                <span>MAX THRESHOLD: <strong className="text-amber-800">{matchedCrop.maxSafeTemp}°C</strong></span>
              </div>
            )}
          </div>

          {/* Storage Racks Allocation Grid */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[10px] text-neutral-500 font-semibold mb-2">
              <span>STORAGE BAYS // RACK ALLOCATION</span>
              <span className="text-black font-bold">{selectedChamber.racks.filter(r => r.occupied).length} / {selectedChamber.racks.length} BAYS OCCUPIED</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {selectedChamber.racks.map(rack => (
                <div
                  key={rack.id}
                  className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                    rack.occupied
                      ? "bg-neutral-50 border-neutral-300 text-black font-medium"
                      : "bg-white border-neutral-200/70 text-neutral-400"
                  }`}
                >
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>{rack.id}</span>
                    <span className={rack.occupied ? "text-emerald-700" : ""}>
                      {rack.occupied ? `${rack.weightMT} MT` : "VACANT"}
                    </span>
                  </div>
                  {rack.occupied && (
                    <div className="text-[9px] text-neutral-600 truncate mt-1">
                      {rack.farmer || rack.batchId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Setpoint Calibrator */}
          <form onSubmit={handleApplySetpoints} className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-black text-[11px]">CALIBRATE SETPOINTS</span>
              <Sliders className="w-3.5 h-3.5 text-neutral-500" />
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div>
                <label className="text-[10px] text-neutral-500 font-semibold block mb-1">TARGET TEMP (°C)</label>
                <input
                  type="number"
                  step="0.5"
                  value={calibTemp}
                  onChange={e => setCalibTemp(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-300 text-black outline-none focus:border-black font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 font-semibold block mb-1">HUMIDITY (%)</label>
                <input
                  type="number"
                  step="1"
                  value={calibHum}
                  onChange={e => setCalibHum(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-300 text-black outline-none focus:border-black font-mono font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-black text-white font-bold text-xs hover:bg-neutral-800 cursor-pointer shadow-xs transition-all"
            >
              SAVE SETPOINTS
            </button>
          </form>
        </div>

        {/* Live Active Incident Alerts Stream */}
        <div className="aww-card rounded-2xl p-5 border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="aww-tag text-[10px] text-neutral-500 font-bold">
              SAFETY INCIDENT STREAM
            </span>
            <span className="text-[10px] text-amber-800 font-bold px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
              {activeAlerts.length} ACTIVE
            </span>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="text-center py-6 text-neutral-500 text-xs flex items-center justify-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>ZERO ACTIVE SAFETY ALARMS</span>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
              {activeAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl border border-amber-200 bg-amber-50 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-neutral-900 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{alert.title}</span>
                    </div>
                    <p className="text-[11px] text-neutral-700 font-sans leading-tight">
                      {alert.message}
                    </p>
                  </div>

                  <button
                    onClick={() => onResolveAlert(alert.id)}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shrink-0 cursor-pointer transition-all shadow-xs"
                  >
                    RESOLVE
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
