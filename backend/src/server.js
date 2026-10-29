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

// CORS - Unconditionally allow all origins & preflight requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

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

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[ColdStorage Backend] Server running on http://localhost:${PORT}`);
  });
}

export default app;