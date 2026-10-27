import { Router } from "express";
import { simulator } from "../simulator.js";

const router = Router();

// GET /api/overview
router.get("/overview", (req, res) => {
  res.json({
    success: true,
    data: simulator.getOverview()
  });
});

// GET /api/chambers
router.get("/chambers", (req, res) => {
  res.json({
    success: true,
    data: simulator.chambers
  });
});

// POST /api/chambers/:id/door-toggle
router.post("/chambers/:id/door-toggle", (req, res) => {
  const ch = simulator.toggleDoor(req.params.id);
  if (!ch) return res.status(404).json({ success: false, message: "Chamber not found" });
  res.json({ success: true, data: ch });
});

// POST /api/chambers/:id/spike
router.post("/chambers/:id/spike", (req, res) => {
  const { targetTemp } = req.body;
  const ch = simulator.triggerTempSpike(req.params.id, targetTemp);
  if (!ch) return res.status(404).json({ success: false, message: "Chamber not found" });
  res.json({ success: true, data: ch });
});

// POST /api/chambers/:id/defrost
router.post("/chambers/:id/defrost", (req, res) => {
  const ch = simulator.triggerDefrost(req.params.id);
  if (!ch) return res.status(404).json({ success: false, message: "Chamber not found" });
  res.json({ success: true, data: ch });
});

// POST /api/chambers/:id/reset
router.post("/chambers/:id/reset", (req, res) => {
  const ch = simulator.resetChamber(req.params.id);
  if (!ch) return res.status(404).json({ success: false, message: "Chamber not found" });
  res.json({ success: true, data: ch });
});

// PUT /api/chambers/:id/target
router.put("/chambers/:id/target", (req, res) => {
  const { temp, humidity } = req.body;
  const ch = simulator.setTargetTemp(req.params.id, temp, humidity);
  if (!ch) return res.status(404).json({ success: false, message: "Chamber not found" });
  res.json({ success: true, data: ch });
});

// GET /api/crops
router.get("/crops", (req, res) => {
  res.json({
    success: true,
    data: simulator.crops
  });
});

// GET /api/inventory
router.get("/inventory", (req, res) => {
  res.json({
    success: true,
    data: simulator.inventory
  });
});

// POST /api/inventory
router.post("/inventory", (req, res) => {
  const item = simulator.addInventory(req.body);
  res.status(201).json({ success: true, data: item });
});

// POST /api/inventory/:id/dispatch
router.post("/inventory/:id/dispatch", (req, res) => {
  const item = simulator.dispatchInventory(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: "Inventory item not found" });
  res.json({ success: true, data: item });
});

// GET /api/power
router.get("/power", (req, res) => {
  res.json({
    success: true,
    data: simulator.power
  });
});

// POST /api/power/mode
router.post("/power/mode", (req, res) => {
  const { mode } = req.body;
  if (!mode) return res.status(400).json({ success: false, message: "Mode required" });
  const updated = simulator.setPowerMode(mode);
  res.json({ success: true, data: updated });
});

// GET /api/equipment
router.get("/equipment", (req, res) => {
  res.json({
    success: true,
    data: simulator.equipment
  });
});

// POST /api/equipment/:id/service
router.post("/equipment/:id/service", (req, res) => {
  const eq = simulator.serviceEquipment(req.params.id);
  if (!eq) return res.status(404).json({ success: false, message: "Equipment not found" });
  res.json({ success: true, data: eq });
});

// GET /api/alerts
router.get("/alerts", (req, res) => {
  res.json({
    success: true,
    data: simulator.alerts
  });
});

// POST /api/alerts/:id/ack
router.post("/alerts/:id/ack", (req, res) => {
  const alert = simulator.acknowledgeAlert(req.params.id);
  if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });
  res.json({ success: true, data: alert });
});

// POST /api/alerts/:id/resolve
router.post("/alerts/:id/resolve", (req, res) => {
  const alert = simulator.resolveAlert(req.params.id);
  if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });
  res.json({ success: true, data: alert });
});

// GET /api/stream - Server-Sent Events (SSE) for live real-time push
router.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  // Send initial data immediately
  res.write(`event: initial\ndata: ${JSON.stringify(simulator.getOverview())}\n\n`);

  simulator.addClient(res);

  req.on("close", () => {
    simulator.removeClient(res);
  });
});

export default router;
