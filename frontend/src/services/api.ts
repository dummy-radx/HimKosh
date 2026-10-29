import {
  FacilityOverview,
  Chamber,
  CropGuideline,
  InventoryItem,
  EquipmentItem,
  PowerState,
  AlertItem
} from "../types";

const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.replace(/\/+$/, "").endsWith("/api")
      ? rawApiUrl.replace(/\/+$/, "")
      : `${rawApiUrl.replace(/\/+$/, "")}/api`)
  : "http://localhost:5001/api";

export async function fetchOverview(): Promise<FacilityOverview> {
  const res = await fetch(`${API_BASE_URL}/overview`);
  const json = await res.json();
  return json.data;
}

export async function fetchChambers(): Promise<Chamber[]> {
  const res = await fetch(`${API_BASE_URL}/chambers`);
  const json = await res.json();
  return json.data;
}

export async function toggleChamberDoor(chamberId: string): Promise<Chamber> {
  const res = await fetch(`${API_BASE_URL}/chambers/${chamberId}/door-toggle`, {
    method: "POST"
  });
  const json = await res.json();
  return json.data;
}

export async function triggerTempSpike(chamberId: string, targetTemp: number): Promise<Chamber> {
  const res = await fetch(`${API_BASE_URL}/chambers/${chamberId}/spike`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetTemp })
  });
  const json = await res.json();
  return json.data;
}

export async function triggerDefrost(chamberId: string): Promise<Chamber> {
  const res = await fetch(`${API_BASE_URL}/chambers/${chamberId}/defrost`, {
    method: "POST"
  });
  const json = await res.json();
  return json.data;
}

export async function resetChamber(chamberId: string): Promise<Chamber> {
  const res = await fetch(`${API_BASE_URL}/chambers/${chamberId}/reset`, {
    method: "POST"
  });
  const json = await res.json();
  return json.data;
}

export async function updateChamberTarget(chamberId: string, temp: number, humidity?: number): Promise<Chamber> {
  const res = await fetch(`${API_BASE_URL}/chambers/${chamberId}/target`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ temp, humidity })
  });
  const json = await res.json();
  return json.data;
}

export async function fetchCrops(): Promise<CropGuideline[]> {
  const res = await fetch(`${API_BASE_URL}/crops`);
  const json = await res.json();
  return json.data;
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const res = await fetch(`${API_BASE_URL}/inventory`);
  const json = await res.json();
  return json.data;
}

export async function createInventory(item: Partial<InventoryItem>): Promise<InventoryItem> {
  const res = await fetch(`${API_BASE_URL}/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  const json = await res.json();
  return json.data;
}

export async function dispatchInventory(id: string): Promise<InventoryItem> {
  const res = await fetch(`${API_BASE_URL}/inventory/${id}/dispatch`, {
    method: "POST"
  });
  const json = await res.json();
  return json.data;
}

export async function fetchPower(): Promise<PowerState> {
  const res = await fetch(`${API_BASE_URL}/power`);
  const json = await res.json();
  return json.data;
}

export async function updatePowerMode(mode: string): Promise<PowerState> {
  const res = await fetch(`${API_BASE_URL}/power/mode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode })
  });
  const json = await res.json();
  return json.data;
}

export async function fetchEquipment(): Promise<EquipmentItem[]> {
  const res = await fetch(`${API_BASE_URL}/equipment`);
  const json = await res.json();
  return json.data;
}

export async function serviceEquipment(id: string): Promise<EquipmentItem> {
  const res = await fetch(`${API_BASE_URL}/equipment/${id}/service`, {
    method: "POST"
  });
  const json = await res.json();
  return json.data;
}

export async function fetchAlerts(): Promise<AlertItem[]> {
  const res = await fetch(`${API_BASE_URL}/alerts`);
  const json = await res.json();
  return json.data;
}

export async function acknowledgeAlert(id: string): Promise<AlertItem> {
  const res = await fetch(`${API_BASE_URL}/alerts/${id}/ack`, {
    method: "POST"
  });
  const json = await res.json();
  return json.data;
}

export async function resolveAlert(id: string): Promise<AlertItem> {
  const res = await fetch(`${API_BASE_URL}/alerts/${id}/resolve`, {
    method: "POST"
  });
  const json = await res.json();
  return json.data;
}

export function subscribeTelemetryStream(
  onTelemetry: (data: FacilityOverview) => void,
  onAlert?: (alert: AlertItem) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE_URL}/stream`);

  eventSource.addEventListener("initial", (event) => {
    try {
      const data = JSON.parse(event.data);
      onTelemetry(data);
    } catch (e) {
      console.error("Error parsing initial SSE", e);
    }
  });

  eventSource.addEventListener("telemetry", (event) => {
    try {
      const data = JSON.parse(event.data);
      onTelemetry(data);
    } catch (e) {
      console.error("Error parsing telemetry SSE", e);
    }
  });

  eventSource.addEventListener("alert", (event) => {
    try {
      const alert = JSON.parse(event.data);
      if (onAlert) onAlert(alert);
    } catch (e) {
      console.error("Error parsing alert SSE", e);
    }
  });

  eventSource.onerror = (err) => {
    console.warn("SSE connection error, closing...", err);
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
}
