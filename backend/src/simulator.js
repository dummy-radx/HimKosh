import {
  CROP_GUIDELINES,
  INITIAL_CHAMBERS,
  INITIAL_INVENTORY,
  INITIAL_EQUIPMENT,
  INITIAL_POWER_STATE,
  INITIAL_ALERTS
} from "./data/store.js";

class ColdStorageSimulator {
  constructor() {
    this.crops = JSON.parse(JSON.stringify(CROP_GUIDELINES));
    this.chambers = JSON.parse(JSON.stringify(INITIAL_CHAMBERS));
    this.inventory = JSON.parse(JSON.stringify(INITIAL_INVENTORY));
    this.equipment = JSON.parse(JSON.stringify(INITIAL_EQUIPMENT));
    this.power = JSON.parse(JSON.stringify(INITIAL_POWER_STATE));
    this.alerts = JSON.parse(JSON.stringify(INITIAL_ALERTS));
    this.sseClients = new Set();
    this.timer = null;

    this.recalculateChamberCapacities();
    this.startSimulationLoop();
  }

  // Subscribe SSE clients
  addClient(res) {
    this.sseClients.add(res);
  }

  removeClient(res) {
    this.sseClients.delete(res);
  }

  broadcast(eventType, payload) {
    const data = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(data);
      } catch (err) {
        this.sseClients.delete(client);
      }
    }
  }

  recalculateChamberCapacities() {
    // calculate used capacity from active inventory
    for (const chamber of this.chambers) {
      const chamberItems = this.inventory.filter(
        item => item.chamberId === chamber.id && item.status === "Stored"
      );
      const totalUsedMT = chamberItems.reduce((acc, item) => acc + (Number(item.quantityMT) || 0), 0);
      chamber.usedMT = Math.round(totalUsedMT * 10) / 10;
    }
  }

  startSimulationLoop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.tick();
    }, 2500);
  }

  tick() {
    const now = new Date();

    // 1. Simulate Chambers
    for (const ch of this.chambers) {
      const crop = this.crops.find(c => c.id === ch.cropId);

      if (ch.doorOpen) {
        // Temperature rises towards ambient if door is open
        const diff = ch.ambientTemp - ch.currentTemp;
        ch.currentTemp = Math.round((ch.currentTemp + diff * 0.05) * 10) / 10;
        ch.currentHumidity = Math.max(50, Math.round((ch.currentHumidity - 0.8) * 10) / 10);
      } else if (ch.defrostActive) {
        // In defrost mode, electric heating warms coil slightly
        if (ch.currentTemp < ch.targetTemp + 3.0) {
          ch.currentTemp = Math.round((ch.currentTemp + 0.2) * 10) / 10;
        }
      } else {
        // Normal temperature regulation
        const drift = (Math.random() - 0.49) * 0.12;
        const targetPull = (ch.targetTemp - ch.currentTemp) * 0.15;
        ch.currentTemp = Math.round((ch.currentTemp + targetPull + drift) * 10) / 10;

        // Humidity drift
        const humDrift = (Math.random() - 0.5) * 0.3;
        const humPull = (ch.targetHumidity - ch.currentHumidity) * 0.1;
        ch.currentHumidity = Math.min(99, Math.max(40, Math.round((ch.currentHumidity + humPull + humDrift) * 10) / 10));

        // Ethylene drift
        if (ch.currentEthylene !== undefined) {
          const ethDrift = (Math.random() - 0.5) * 0.01;
          ch.currentEthylene = Math.max(0.01, Math.round((ch.currentEthylene + ethDrift) * 100) / 100);
        }
      }

      // Append to history for sparklines
      if (!ch.history) ch.history = [];
      ch.history.push(ch.currentTemp);
      if (ch.history.length > 20) ch.history.shift();

      // Check thresholds
      if (crop) {
        if (ch.currentTemp > crop.maxSafeTemp) {
          ch.status = "CRITICAL_HIGH";
          this.ensureAlert({
            id: `TEMP_HIGH_${ch.id}`,
            severity: "CRITICAL",
            category: "TEMPERATURE",
            chamberId: ch.id,
            title: `Critical High Temp in ${ch.name}`,
            message: `Temperature reached ${ch.currentTemp}°C, exceeding safe crop limit of ${crop.maxSafeTemp}°C for ${crop.name}. Produce quality at risk.`
          });
        } else if (ch.currentTemp < crop.minSafeTemp) {
          ch.status = "CRITICAL_LOW";
          this.ensureAlert({
            id: `TEMP_LOW_${ch.id}`,
            severity: "CRITICAL",
            category: "TEMPERATURE",
            chamberId: ch.id,
            title: `Frost Risk in ${ch.name}`,
            message: `Temperature dropped to ${ch.currentTemp}°C, below minimum safe threshold of ${crop.minSafeTemp}°C for ${crop.name}. Chill injury hazard.`
          });
        } else if (
          ch.currentTemp > crop.idealTempMax + 0.5 ||
          ch.currentTemp < crop.idealTempMin - 0.5
        ) {
          ch.status = "WARNING";
        } else {
          ch.status = "OPTIMAL";
        }
      }
    }

    // 2. Simulate Solar & Power Micro-fluctuations
    this.updatePowerState();

    // 3. Broadcast snapshot to SSE clients
    this.broadcast("telemetry", this.getOverview());
  }

  ensureAlert({ id, severity, category, chamberId, title, message }) {
    const existing = this.alerts.find(a => a.id === id && !a.resolved);
    if (!existing) {
      const newAlert = {
        id,
        timestamp: new Date().toISOString(),
        severity,
        category,
        chamberId,
        title,
        message,
        resolved: false,
        acknowledged: false
      };
      this.alerts.unshift(newAlert);
      this.broadcast("alert", newAlert);
    }
  }

  updatePowerState() {
    if (this.power.mode === "SOLAR_HYBRID") {
      // Slight solar fluctuation
      const solarFluct = (Math.random() - 0.48) * 1.5;
      this.power.solarGenerationKw = Math.max(
        15,
        Math.min(95, Math.round((this.power.solarGenerationKw + solarFluct) * 10) / 10)
      );
      this.power.facilityLoadKw = Math.round((52 + (Math.random() - 0.5) * 2) * 10) / 10;
      
      const net = this.power.solarGenerationKw - this.power.facilityLoadKw;
      if (net > 0) {
        this.power.gridImportKw = 0;
        this.power.gridExportKw = Math.round(net * 10) / 10;
        this.power.batteryPowerKw = -14.5; // charging
      } else {
        this.power.gridExportKw = 0;
        this.power.gridImportKw = Math.round(Math.abs(net) * 10) / 10;
        this.power.batteryPowerKw = 8.2; // discharging
      }
      this.power.batterySocPercent = Math.min(100, Math.max(10, Math.round((this.power.batterySocPercent + 0.05) * 10) / 10));
    } else if (this.power.mode === "BATTERY_BACKUP") {
      // Grid outage simulated!
      this.power.gridImportKw = 0;
      this.power.gridExportKw = 0;
      this.power.solarGenerationKw = 42.0;
      this.power.facilityLoadKw = 48.0;
      this.power.batteryPowerKw = 6.0; // discharging to cover deficit
      this.power.batterySocPercent = Math.max(15, Math.round((this.power.batterySocPercent - 0.2) * 10) / 10);
      this.power.batteryStoredKwh = Math.round((this.power.batteryCapacityKwh * (this.power.batterySocPercent / 100)) * 10) / 10;
      this.power.batteryRuntimeHours = Math.round((this.power.batteryStoredKwh / 25) * 10) / 10;
    } else if (this.power.mode === "THERMAL_DISCHARGE") {
      // Ice storage / phase change thermal buffer handling cooling
      this.power.thermalDischargeRateTonHours = 45;
      this.power.thermalStorageChargePercent = Math.max(20, Math.round((this.power.thermalStorageChargePercent - 0.3) * 10) / 10);
      this.power.facilityLoadKw = 22.0; // chillers offloaded to thermal ice bank!
    }
  }

  // Action methods
  toggleDoor(chamberId) {
    const ch = this.chambers.find(c => c.id === chamberId);
    if (!ch) return null;
    ch.doorOpen = !ch.doorOpen;
    if (ch.doorOpen) {
      this.ensureAlert({
        id: `DOOR_OPEN_${ch.id}_${Date.now()}`,
        severity: "WARNING",
        category: "SECURITY",
        chamberId: ch.id,
        title: `Cold Chamber Door Opened: ${ch.name}`,
        message: `Chamber access hatch was unsealed. Thermal infiltration in progress.`
      });
    }
    return ch;
  }

  triggerTempSpike(chamberId, targetTemp = 6.5) {
    const ch = this.chambers.find(c => c.id === chamberId);
    if (!ch) return null;
    ch.currentTemp = Number(targetTemp);
    ch.compressorRunning = false;
    this.tick();
    return ch;
  }

  triggerDefrost(chamberId) {
    const ch = this.chambers.find(c => c.id === chamberId);
    if (!ch) return null;
    ch.defrostActive = !ch.defrostActive;
    ch.status = ch.defrostActive ? "DEFROSTING" : "OPTIMAL";
    return ch;
  }

  setTargetTemp(chamberId, temp, humidity) {
    const ch = this.chambers.find(c => c.id === chamberId);
    if (!ch) return null;
    if (temp !== undefined) ch.targetTemp = Number(temp);
    if (humidity !== undefined) ch.targetHumidity = Number(humidity);
    return ch;
  }

  resetChamber(chamberId) {
    const ch = this.chambers.find(c => c.id === chamberId);
    if (!ch) return null;
    const crop = this.crops.find(c => c.id === ch.cropId);
    if (crop) {
      ch.targetTemp = (crop.idealTempMin + crop.idealTempMax) / 2;
      ch.currentTemp = ch.targetTemp;
      ch.currentHumidity = (crop.idealHumidityMin + crop.idealHumidityMax) / 2;
    }
    ch.doorOpen = false;
    ch.defrostActive = false;
    ch.compressorRunning = true;
    ch.status = "OPTIMAL";

    // Auto resolve temp alerts for this chamber
    this.alerts = this.alerts.map(a => {
      if (a.chamberId === chamberId && !a.resolved) {
        return { ...a, resolved: true, resolvedAt: new Date().toISOString() };
      }
      return a;
    });

    return ch;
  }

  setPowerMode(mode) {
    this.power.mode = mode;
    this.ensureAlert({
      id: `POWER_MODE_${Date.now()}`,
      severity: mode === "BATTERY_BACKUP" ? "WARNING" : "INFO",
      category: "POWER",
      chamberId: null,
      title: `Power Mode Switched: ${mode}`,
      message: `System transitioned power management profile to ${mode}.`
    });
    return this.power;
  }

  addInventory(item) {
    const id = `INV-${Date.now().toString().slice(-4)}`;
    const lotNumber = `LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newItem = {
      id,
      lotNumber,
      farmerName: item.farmerName || "Unnamed Producer",
      farmerPhone: item.farmerPhone || "N/A",
      farmerLocation: item.farmerLocation || "Local District",
      cropId: item.cropId,
      cropName: item.cropName || item.cropId,
      chamberId: item.chamberId,
      rackLocation: item.rackLocation || "General Floor",
      quantityMT: Number(item.quantityMT) || 1,
      cratesCount: Number(item.cratesCount) || Math.round((item.quantityMT || 1) * 50),
      intakeDate: item.intakeDate || new Date().toISOString().split("T")[0],
      expectedExitDate: item.expectedExitDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      qualityGrade: item.qualityGrade || "Grade A",
      status: "Stored",
      dailyRatePerMT: Number(item.dailyRatePerMT) || 210,
      storageCostAccrued: 0
    };

    this.inventory.unshift(newItem);
    this.recalculateChamberCapacities();
    return newItem;
  }

  dispatchInventory(id) {
    const item = this.inventory.find(i => i.id === id);
    if (!item) return null;
    item.status = "Dispatched";
    item.dispatchedAt = new Date().toISOString();
    
    // calculate final storage days & bill
    const intake = new Date(item.intakeDate);
    const exit = new Date();
    const days = Math.max(1, Math.round((exit - intake) / (1000 * 60 * 60 * 24)));
    item.storageDaysTotal = days;
    item.finalBillAmount = Math.round(days * item.quantityMT * item.dailyRatePerMT * 100) / 100;

    this.recalculateChamberCapacities();
    return item;
  }

  serviceEquipment(id) {
    const eq = this.equipment.find(e => e.id === id);
    if (!eq) return null;
    eq.status = "HEALTHY";
    eq.runHoursSinceService = 0;
    eq.lastMaintenanceDate = new Date().toISOString().split("T")[0];
    eq.nextServiceDueDays = Math.round(eq.serviceIntervalHours / 24);
    if (eq.scaleWarning) eq.scaleWarning = "Cleaned & descaled";

    this.ensureAlert({
      id: `SVC_${id}_${Date.now()}`,
      severity: "INFO",
      category: "EQUIPMENT",
      chamberId: null,
      title: `Equipment Serviced: ${eq.name}`,
      message: `Technician verified operational health and reset service intervals.`
    });

    return eq;
  }

  acknowledgeAlert(id) {
    const alert = this.alerts.find(a => a.id === id);
    if (!alert) return null;
    alert.acknowledged = true;
    return alert;
  }

  resolveAlert(id) {
    const alert = this.alerts.find(a => a.id === id);
    if (!alert) return null;
    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();
    return alert;
  }

  getOverview() {
    const totalCapacityMT = this.chambers.reduce((acc, c) => acc + c.capacityMT, 0);
    const totalUsedMT = Math.round(this.chambers.reduce((acc, c) => acc + c.usedMT, 0) * 10) / 10;
    const availableSpaceMT = Math.round((totalCapacityMT - totalUsedMT) * 10) / 10;
    const occupancyPercent = Math.round((totalUsedMT / totalCapacityMT) * 100);

    const activeAlerts = this.alerts.filter(a => !a.resolved);
    const criticalAlertsCount = activeAlerts.filter(a => a.severity === "CRITICAL").length;
    const warningAlertsCount = activeAlerts.filter(a => a.severity === "WARNING").length;

    const healthyEquipmentCount = this.equipment.filter(e => e.status === "HEALTHY" || e.status === "STANDBY_READY").length;

    return {
      facility: {
        name: "HimKosh Agro-Logistics Hub #4",
        location: "Kashmir-Himachal Agri Corridor",
        lastTelemetrySync: new Date().toISOString(),
        overallHealth: criticalAlertsCount > 0 ? "CRITICAL_ATTENTION" : warningAlertsCount > 0 ? "MONITORING_REQUIRED" : "OPTIMAL"
      },
      capacity: {
        totalCapacityMT,
        totalUsedMT,
        availableSpaceMT,
        occupancyPercent
      },
      power: this.power,
      alertsSummary: {
        totalActive: activeAlerts.length,
        critical: criticalAlertsCount,
        warning: warningAlertsCount
      },
      equipmentSummary: {
        totalUnits: this.equipment.length,
        healthyUnits: healthyEquipmentCount
      },
      chambers: this.chambers
    };
  }
}

export const simulator = new ColdStorageSimulator();
