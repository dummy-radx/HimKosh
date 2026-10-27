import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "./components/Navbar";
import { OverviewStats } from "./components/OverviewStats";
import { ChamberCard } from "./components/ChamberCard";
import { InventoryTab } from "./components/InventoryTab";
import { CropsGuidelineTab } from "./components/CropsGuidelineTab";
import { PowerGridTab } from "./components/PowerGridTab";
import { EquipmentTab } from "./components/EquipmentTab";
import { AlertsModal } from "./components/AlertsModal";
import { SimulationDrawer } from "./components/SimulationDrawer";

import {
  FacilityOverview,
  CropGuideline,
  InventoryItem,
  EquipmentItem,
  AlertItem
} from "./types";

import * as api from "./services/api";

export function App() {
  const [overview, setOverview] = useState<FacilityOverview | null>(null);
  const [crops, setCrops] = useState<CropGuideline[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isSimDrawerOpen, setIsSimDrawerOpen] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const prevAlertsCount = useRef<number>(0);

  // Play Web Audio synthetic chime for critical alerts
  const playAlertChime = () => {
    if (!audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // AudioContext may require user interaction
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Initial Data Fetch
  const loadInitialData = async () => {
    try {
      const [ovData, cropsData, invData, eqData, alertsData] = await Promise.all([
        api.fetchOverview(),
        api.fetchCrops(),
        api.fetchInventory(),
        api.fetchEquipment(),
        api.fetchAlerts()
      ]);

      setOverview(ovData);
      setCrops(cropsData);
      setInventory(invData);
      setEquipment(eqData);
      setAlerts(alertsData);
      prevAlertsCount.current = alertsData.filter(a => !a.resolved).length;
    } catch (err) {
      console.error("Initial data load error:", err);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Subscribe to SSE stream for real-time live telemetry
    const unsubscribe = api.subscribeTelemetryStream(
      (newOverview) => {
        setOverview(newOverview);
      },
      (newAlert) => {
        setAlerts(prev => [newAlert, ...prev]);
        if (newAlert.severity === "CRITICAL") {
          playAlertChime();
          showToast(`🚨 ${newAlert.title}`);
        }
      }
    );

    // Fallback polling every 5 seconds to keep alerts and inventory in sync
    const interval = setInterval(async () => {
      try {
        const [alertsData, invData, eqData] = await Promise.all([
          api.fetchAlerts(),
          api.fetchInventory(),
          api.fetchEquipment()
        ]);
        setAlerts(alertsData);
        setInventory(invData);
        setEquipment(eqData);

        const activeAlerts = alertsData.filter(a => !a.resolved);
        if (activeAlerts.length > prevAlertsCount.current) {
          playAlertChime();
        }
        prevAlertsCount.current = activeAlerts.length;
      } catch (err) {
        // quiet fallback
      }
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [audioEnabled]);

  // Chamber Actions
  const handleToggleDoor = async (chamberId: string) => {
    try {
      const updated = await api.toggleChamberDoor(chamberId);
      showToast(updated.doorOpen ? `⚠️ ${chamberId} door opened! Thermal breach started.` : `🔒 ${chamberId} door sealed.`);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSpikeTemp = async (chamberId: string, temp: number) => {
    try {
      await api.triggerTempSpike(chamberId, temp);
      playAlertChime();
      showToast(`🔥 Temperature spiked in ${chamberId} to ${temp}°C! Crop threshold alarm triggered.`);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerDefrost = async (chamberId: string) => {
    try {
      const updated = await api.triggerDefrost(chamberId);
      showToast(updated.defrostActive ? `❄️ Defrost cycle initiated for ${chamberId}` : `Completed defrost for ${chamberId}`);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetChamber = async (chamberId: string) => {
    try {
      await api.resetChamber(chamberId);
      showToast(`✅ ${chamberId} calibrated and restored to optimal target.`);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTarget = async (chamberId: string, temp: number, humidity: number) => {
    try {
      await api.updateChamberTarget(chamberId, temp, humidity);
      showToast(`⚙️ Setpoints updated for ${chamberId}: ${temp}°C, ${humidity}%`);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Inventory Actions
  const handleAddInventory = async (item: Partial<InventoryItem>) => {
    try {
      const created = await api.createInventory(item);
      showToast(`📦 Check-in successful: Lot ${created.lotNumber} (${created.quantityMT} MT)`);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDispatchInventory = async (id: string) => {
    try {
      const dispatched = await api.dispatchInventory(id);
      showToast(`🚚 Dispatched Lot ${dispatched.lotNumber}! Space reclaimed.`);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Power Actions
  const handleSetPowerMode = async (mode: string) => {
    try {
      await api.updatePowerMode(mode);
      showToast(`⚡ Microgrid profile switched to: ${mode}`);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Equipment Actions
  const handleServiceEquipment = async (id: string) => {
    try {
      await api.serviceEquipment(id);
      showToast(`🛠️ Service completed and logged for ${id}`);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Alert Actions
  const handleAcknowledgeAlert = async (id: string) => {
    try {
      await api.acknowledgeAlert(id);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await api.resolveAlert(id);
      showToast(`Alert resolved.`);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const refreshData = async () => {
    try {
      const [ovData, alertsData, invData, eqData] = await Promise.all([
        api.fetchOverview(),
        api.fetchAlerts(),
        api.fetchInventory(),
        api.fetchEquipment()
      ]);
      setOverview(ovData);
      setAlerts(alertsData);
      setInventory(invData);
      setEquipment(eqData);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        overview={overview}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
        onOpenSimulationDrawer={() => setIsSimDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {/* KPI Banner shown across top */}
        {overview && (
          <OverviewStats
            overview={overview}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* Tab 1: Chambers & Live IoT Telemetry */}
        {activeTab === "overview" && overview && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white font-heading">
                  Storage Units & Environmental Control Vaults
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time IoT sensors: temperature, humidity, ethylene gas, compressor telemetry, and capacity.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSimDrawerOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Simulate Events</span>
                </button>
              </div>
            </div>

            {/* Cold Chambers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {overview.chambers.map((chamber) => (
                <ChamberCard
                  key={chamber.id}
                  chamber={chamber}
                  crops={crops}
                  onToggleDoor={handleToggleDoor}
                  onSpikeTemp={handleSpikeTemp}
                  onTriggerDefrost={handleTriggerDefrost}
                  onResetChamber={handleResetChamber}
                  onUpdateTarget={handleUpdateTarget}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Produce Inventory Tracking */}
        {activeTab === "inventory" && overview && (
          <InventoryTab
            inventory={inventory}
            chambers={overview.chambers}
            crops={crops}
            onAddInventory={handleAddInventory}
            onDispatchInventory={handleDispatchInventory}
          />
        )}

        {/* Tab 3: Crop Guidelines & Thresholds */}
        {activeTab === "crops" && overview && (
          <CropsGuidelineTab
            crops={crops}
            chambers={overview.chambers}
            onSelectChamber={(chamberId) => {
              setActiveTab("overview");
            }}
          />
        )}

        {/* Tab 4: Solar Generation & Microgrid (BESS) */}
        {activeTab === "power" && overview && (
          <PowerGridTab
            power={overview.power}
            onSetPowerMode={handleSetPowerMode}
          />
        )}

        {/* Tab 5: Equipment Health & Predictive Maintenance */}
        {activeTab === "equipment" && (
          <EquipmentTab
            equipment={equipment}
            onServiceEquipment={handleServiceEquipment}
          />
        )}
      </main>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl bg-slate-900/95 border border-cyan-500/50 text-white text-xs font-medium shadow-2xl shadow-cyan-950/50 backdrop-blur-md flex items-center gap-3 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Alerts Slide-over / Modal */}
      <AlertsModal
        alerts={alerts}
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onResolveAlert={handleResolveAlert}
      />

      {/* Simulation Controls Drawer */}
      <SimulationDrawer
        isOpen={isSimDrawerOpen}
        onClose={() => setIsSimDrawerOpen(false)}
        onToggleDoor={handleToggleDoor}
        onSpikeTemp={handleSpikeTemp}
        onTriggerDefrost={handleTriggerDefrost}
        onSetPowerMode={handleSetPowerMode}
        onResetChamber={handleResetChamber}
      />
    </div>
  );
}

export default App;
