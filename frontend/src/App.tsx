import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopHUD } from "./components/TopHUD";
import { ChamberCockpit } from "./components/ChamberCockpit";
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
          showToast(`🚨 ${newAlert.title}`);
        }
      }
    );

    // Fallback polling
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
      } catch (err) {
        // quiet fallback
      }
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Chamber Actions
  const handleToggleDoor = async (chamberId: string) => {
    try {
      const updated = await api.toggleChamberDoor(chamberId);
      showToast(updated.doorOpen ? `⚠️ ${chamberId} hatch unsealed! Thermal infiltration active.` : `🔒 ${chamberId} hatch sealed.`);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSpikeTemp = async (chamberId: string, temp: number) => {
    try {
      await api.triggerTempSpike(chamberId, temp);
      showToast(`🔥 Thermal spike triggered in ${chamberId} (+${temp}°C). Threshold alert triggered.`);
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
      showToast(`✅ ${chamberId} restored to safe agronomic threshold.`);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTarget = async (chamberId: string, temp: number, humidity: number) => {
    try {
      await api.updateChamberTarget(chamberId, temp, humidity);
      showToast(`⚙️ Setpoints calibrated for ${chamberId}: ${temp}°C, ${humidity}%`);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Inventory Actions
  const handleAddInventory = async (item: Partial<InventoryItem>) => {
    try {
      const created = await api.createInventory(item);
      showToast(`📦 Intake logged: Lot ${created.lotNumber} (${created.quantityMT} MT)`);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDispatchInventory = async (id: string) => {
    try {
      const dispatched = await api.dispatchInventory(id);
      showToast(`🚚 Dispatched Lot ${dispatched.lotNumber}! Bay space vacated.`);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Power Actions
  const handleSetPowerMode = async (mode: string) => {
    try {
      await api.updatePowerMode(mode);
      showToast(`⚡ Microgrid profile shifted to: ${mode}`);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Equipment Actions
  const handleServiceEquipment = async (id: string) => {
    try {
      await api.serviceEquipment(id);
      showToast(`🛠️ Service record registered for ${id}`);
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

  const totalAlerts = alerts.filter(a => !a.resolved).length;
  const criticalAlerts = alerts.filter(a => !a.resolved && a.severity === "CRITICAL").length;

  return (
    <div className="flex h-screen bg-[#f8fafc] bg-grid-pattern text-neutral-900 overflow-hidden select-none selection:bg-black selection:text-white">
      {/* 1. Sleek Left Control Rail */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSimulation={() => setIsSimDrawerOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        alertsCount={totalAlerts}
        criticalCount={criticalAlerts}
      />

      {/* 2. Main Stage (HUD + Cockpit Views) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Status HUD */}
        <TopHUD
          overview={overview}
          onNavigateTab={setActiveTab}
          onOpenAlerts={() => setIsAlertsOpen(true)}
        />

        {/* Scrollable Main Cockpit Area */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {/* Tab 1: Flagship Chamber Cockpit (Split Screen Console) */}
          {activeTab === "overview" && overview && (
            <ChamberCockpit
              chambers={overview.chambers}
              crops={crops}
              power={overview.power}
              alerts={alerts}
              onToggleDoor={handleToggleDoor}
              onSpikeTemp={handleSpikeTemp}
              onTriggerDefrost={handleTriggerDefrost}
              onResetChamber={handleResetChamber}
              onUpdateTarget={handleUpdateTarget}
              onResolveAlert={handleResolveAlert}
            />
          )}

          {/* Tab 2: Produce Inventory Ledger */}
          {activeTab === "inventory" && overview && (
            <InventoryTab
              inventory={inventory}
              chambers={overview.chambers}
              crops={crops}
              onAddInventory={handleAddInventory}
              onDispatchInventory={handleDispatchInventory}
            />
          )}

          {/* Tab 3: Crop Agronomic Matrix */}
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
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl bg-white border border-neutral-300 text-black text-xs font-mono font-bold shadow-xl flex items-center gap-3 animate-fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
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
