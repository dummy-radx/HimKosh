import React, { useState } from "react";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Check, 
  X
} from "lucide-react";
import { AlertItem } from "../types";

interface AlertsModalProps {
  alerts: AlertItem[];
  isOpen: boolean;
  onClose: () => void;
  onAcknowledgeAlert: (id: string) => Promise<void>;
  onResolveAlert: (id: string) => Promise<void>;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  alerts,
  isOpen,
  onClose,
  onAcknowledgeAlert,
  onResolveAlert
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  if (!isOpen) return null;

  const filtered = alerts.filter(a => {
    if (filterSeverity === "ACTIVE") return !a.resolved;
    if (filterSeverity === "RESOLVED") return a.resolved;
    if (filterSeverity === "CRITICAL") return a.severity === "CRITICAL";
    if (filterSeverity === "WARNING") return a.severity === "WARNING";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-mono">
      <div className="aww-card max-w-2xl w-full rounded-2xl p-6 bg-white border border-neutral-300 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-black font-heading tracking-tight">
                ALARMS & SAFETY AUDIT LOG
              </h2>
              <p className="text-[11px] text-neutral-500">
                Crop threshold breaches, door open security, and equipment fault events.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 hover:text-black cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
          {[
            { id: "ALL", label: `ALL (${alerts.length})` },
            { id: "ACTIVE", label: `ACTIVE (${alerts.filter(a => !a.resolved).length})` },
            { id: "CRITICAL", label: `CRITICAL (${alerts.filter(a => a.severity === "CRITICAL").length})` },
            { id: "WARNING", label: `WARNINGS (${alerts.filter(a => a.severity === "WARNING").length})` },
            { id: "RESOLVED", label: `RESOLVED (${alerts.filter(a => a.resolved).length})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterSeverity(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterSeverity === f.id
                  ? "bg-black text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-60" />
              NO ALARMS RECORDED UNDER THIS FILTER
            </div>
          ) : (
            filtered.map(alert => {
              const isCrit = alert.severity === "CRITICAL";

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    alert.resolved
                      ? "bg-neutral-50 border-neutral-200 opacity-60"
                      : isCrit
                      ? "bg-amber-50 border-amber-300"
                      : "bg-white border-neutral-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                      isCrit ? "bg-amber-200 text-amber-900" : "bg-neutral-100 text-neutral-800"
                    }`}>
                      {isCrit ? <AlertTriangle className="w-4 h-4 animate-bounce" /> : <Info className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-black text-sm">
                          {alert.title}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          isCrit ? "bg-amber-400 text-black" : "bg-neutral-200 text-neutral-800"
                        }`}>
                          {alert.severity}
                        </span>
                        {alert.chamberId && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-black border border-neutral-200 font-bold">
                            {alert.chamberId}
                          </span>
                        )}
                      </div>

                      <p className="text-neutral-700 text-xs leading-relaxed max-w-lg font-sans">
                        {alert.message}
                      </p>

                      <div className="text-[10px] text-neutral-500 mt-2 flex items-center gap-2 font-medium">
                        <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        <span>•</span>
                        <span>CATEGORY: {alert.category}</span>
                        {alert.resolved && (
                          <span className="text-emerald-700 font-bold ml-2">✓ RESOLVED</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!alert.resolved && (
                    <div className="flex items-center gap-2 sm:self-center shrink-0">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 font-bold cursor-pointer shadow-2xs"
                        >
                          ACK
                        </button>
                      )}
                      <button
                        onClick={() => onResolveAlert(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>RESOLVE</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
