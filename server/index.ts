import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import * as fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // __dirname is /path/to/dist/server, so we need ../spa to reach /path/to/dist/spa
  const spaPath = path.join(__dirname, "../spa");
  const staticPath = path.join(__dirname, "../static");

  // Serve static assets (SPA assets)
  app.use(express.static(spaPath));

  // Pre-generated static pages (HTML files for SEO) - served in all environments
  app.get(/.*/, (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }

    // Check if pre-rendered static HTML exists for this route
    const requestPath = req.path === "/" ? "index.html" : `${req.path}/index.html`;
    const staticFilePath = path.join(staticPath, requestPath);

    // Debug logging
    const fileExists = fs.existsSync(staticFilePath);
    if (req.path === "/" || req.path.startsWith("/energopraktiki") || req.path.startsWith("/blog")) {
      console.log(`[SSG] ${req.path} → ${staticFilePath} → exists: ${fileExists}`);
    }

    // Check if static file exists, serve it (before SPA fallback)
    if (process.env.USE_PRERENDER !== "false" && fileExists) {
      try {
        return res.sendFile(staticFilePath);
      } catch (error) {
        console.error(`[SSG] Error serving static file: ${error}`);
        // Fall through to SPA
      }
    }

    // Fall back to SPA for client-side routing
    res.sendFile(path.join(spaPath, "index.html"));
  });

  return app;
}
