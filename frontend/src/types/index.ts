export interface CropGuideline {
  id: string;
  name: string;
  category: string;
  idealTempMin: number;
  idealTempMax: number;
  idealHumidityMin: number;
  idealHumidityMax: number;
  maxSafeTemp: number;
  minSafeTemp: number;
  maxEthylenePpm: number;
  maxStorageDays: number;
  recommendedChamber: string;
  storageFeePerTonPerDay: number;
}

export interface ChamberRack {
  id: string;
  occupied: boolean;
  batchId: string | null;
  farmer: string | null;
  weightMT: number;
}

export interface Chamber {
  id: string;
  name: string;
  cropType: string;
  cropId: string;
  currentTemp: number;
  targetTemp: number;
  currentHumidity: number;
  targetHumidity: number;
  currentEthylene: number;
  capacityMT: number;
  usedMT: number;
  doorOpen: boolean;
  compressorRunning: boolean;
  defrostActive: boolean;
  status: "OPTIMAL" | "WARNING" | "CRITICAL_HIGH" | "CRITICAL_LOW" | "DEFROSTING";
  ambientTemp: number;
  history: number[];
  racks: ChamberRack[];
}

export interface InventoryItem {
  id: string;
  lotNumber: string;
  farmerName: string;
  farmerPhone: string;
  farmerLocation: string;
  cropId: string;
  cropName: string;
  chamberId: string;
  rackLocation: string;
  quantityMT: number;
  cratesCount: number;
  intakeDate: string;
  expectedExitDate: string;
  qualityGrade: string;
  status: "Stored" | "Dispatched" | "Near Expiry";
  dailyRatePerMT: number;
  storageCostAccrued: number;
  dispatchedAt?: string;
  storageDaysTotal?: number;
  finalBillAmount?: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  chamberCoverage: string[];
  status: "HEALTHY" | "ATTENTION_SOON" | "STANDBY_READY" | "CRITICAL";
  efficiencyCOP?: number;
  runHoursTotal: number;
  runHoursSinceService?: number;
  serviceIntervalHours: number;
  suctionPressurePsi?: number;
  dischargePressurePsi?: number;
  motorVibrationMmS?: number;
  oilLevelPercent?: number;
  lastMaintenanceDate: string;
  nextServiceDueDays: number;
  notes: string;
  fanRpm?: number;
  airFlowCfm?: number;
  scaleWarning?: string;
  fuelLevelPercent?: number;
  dcInputKw?: number;
  acOutputKw?: number;
}

export interface PowerState {
  mode: "SOLAR_HYBRID" | "BATTERY_BACKUP" | "THERMAL_DISCHARGE" | "GRID_ONLY" | "GENSET_EMERGENCY";
  solarGenerationKw: number;
  solarDailyProductionKwh: number;
  solarPeakCapacityKw: number;
  solarIrradiancePercent: number;
  facilityLoadKw: number;
  gridImportKw: number;
  gridExportKw: number;
  batterySocPercent: number;
  batteryCapacityKwh: number;
  batteryStoredKwh: number;
  batteryPowerKw: number;
  batteryHealthPercent: number;
  batteryRuntimeHours: number;
  thermalStorageChargePercent: number;
  thermalCapacityTonHours: number;
  thermalStoredTonHours: number;
  thermalDischargeRateTonHours: number;
  thermalReserveHours: number;
  estimatedDailySavingsUsd: number;
  co2SavedKgToday: number;
}

export interface AlertItem {
  id: string;
  timestamp: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  category: "TEMPERATURE" | "EQUIPMENT" | "SECURITY" | "POWER";
  chamberId: string | null;
  title: string;
  message: string;
  resolved: boolean;
  acknowledged: boolean;
  resolvedAt?: string;
}

export interface FacilityOverview {
  facility: {
    name: string;
    location: string;
    lastTelemetrySync: string;
    overallHealth: "OPTIMAL" | "MONITORING_REQUIRED" | "CRITICAL_ATTENTION";
  };
  capacity: {
    totalCapacityMT: number;
    totalUsedMT: number;
    availableSpaceMT: number;
    occupancyPercent: number;
  };
  power: PowerState;
  alertsSummary: {
    totalActive: number;
    critical: number;
    warning: number;
  };
  equipmentSummary: {
    totalUnits: number;
    healthyUnits: number;
  };
  chambers: Chamber[];
}
