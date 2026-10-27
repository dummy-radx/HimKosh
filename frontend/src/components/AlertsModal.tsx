import React, { useState } from "react";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ShieldAlert, 
  Calendar, 
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel max-w-2xl w-full rounded-2xl p-6 border border-white/20 shadow-2xl relative max-h-[85vh] flex flex-col animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-heading">
                Facility Alarms & Safety Audit Log
              </h2>
              <p className="text-xs text-slate-400">
                Critical thermal threshold breaches, door security events, and machinery diagnostics.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
          {[
            { id: "ALL", label: `All (${alerts.length})` },
            { id: "ACTIVE", label: `Active (${alerts.filter(a => !a.resolved).length})` },
            { id: "CRITICAL", label: `Critical (${alerts.filter(a => a.severity === "CRITICAL").length})` },
            { id: "WARNING", label: `Warnings (${alerts.filter(a => a.severity === "WARNING").length})` },
            { id: "RESOLVED", label: `Resolved (${alerts.filter(a => a.resolved).length})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterSeverity(f.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                filterSeverity === f.id
                  ? "bg-cyan-500 text-white font-semibold"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
              No alarms found matching the selected filter.
            </div>
          ) : (
            filtered.map(alert => {
              const isCrit = alert.severity === "CRITICAL";
              const isWarn = alert.severity === "WARNING";

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    alert.resolved
                      ? "bg-slate-900/40 border-slate-800/60 opacity-60"
                      : isCrit
                      ? "bg-rose-950/25 border-rose-500/40 glow-rose"
                      : isWarn
                      ? "bg-amber-950/20 border-amber-500/40"
                      : "bg-slate-900/70 border-slate-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                      isCrit ? "bg-rose-500/20 text-rose-400" : isWarn ? "bg-amber-500/20 text-amber-400" : "bg-cyan-500/20 text-cyan-400"
                    }`}>
                      {isCrit ? <AlertTriangle className="w-4 h-4 animate-bounce" /> : <Info className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">
                          {alert.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCrit ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : isWarn ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-cyan-500/20 text-cyan-300"
                        }`}>
                          {alert.severity}
                        </span>
                        {alert.chamberId && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                            {alert.chamberId}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-300 text-xs leading-relaxed max-w-lg">
                        {alert.message}
                      </p>

                      <div className="text-[10px] text-slate-500 mt-2 flex items-center gap-2">
                        <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        <span>•</span>
                        <span>Category: {alert.category}</span>
                        {alert.resolved && (
                          <span className="text-emerald-400 font-medium ml-2">✓ Resolved</span>
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
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer border border-slate-700"
                        >
                          Ack
                        </button>
                      )}
                      <button
                        onClick={() => onResolveAlert(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolve</span>
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
