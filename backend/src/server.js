import express from "express";
import cors from "cors";
import apiRoutes from "./routes/api.js";

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.use(express.json());

// API Routes
app.use("/api", apiRoutes);

// Health check root
app.get("/", (req, res) => {
  res.json({
    status: "online",
    name: "HimKosh Smart Cold Storage Telemetry API",
    version: "2.4.0",
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[ColdStorage Backend] Server running on http://localhost:${PORT}`);
});