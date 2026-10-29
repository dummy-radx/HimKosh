import express from "express";
import cors from "cors";
import apiRoutes from "./routes/api.js";

try {
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile();
  }
} catch {
  // .env file not present or not required in production
}

const app = express();
const PORT = process.env.PORT || 5001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Middlewares
app.use(cors({
  origin: CORS_ORIGIN === "*" ? "*" : CORS_ORIGIN.split(",").map((s) => s.trim()),
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

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[ColdStorage Backend] Server running on http://localhost:${PORT}`);
  });
}

export default app;