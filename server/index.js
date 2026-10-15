import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import promptRoutes from "./routes/promptRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";



import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// Trust reverse proxy (required for secure cookies & HTTPS recognition on Render, Railway, Vercel, Heroku)
app.set("trust proxy", 1);

connectDB();

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: false,
  })
);

const defaultOrigins = ["http://localhost:5173", "http://localhost:3000"];
const envOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, uptime bots)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "PromptForge API is running",
    status: "healthy",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});


app.use("/api/auth", authRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ message: "Not found" });
});


app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  const isProd = process.env.NODE_ENV === "production";
  res.status(err.status || 500).json({
    message: "Something went wrong. Please try again.",
    ...(!isProd && err?.message ? { detail: err.message } : {}),
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});