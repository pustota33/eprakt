import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createServer } from "./server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: [".", "./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Skip API routes and assets
        if (req.url.startsWith("/api/") || req.url.match(/\.(js|css|json|svg|png|jpg|woff|woff2)$/)) {
          return next();
        }

        // Try to serve pre-rendered static HTML
        const requestPath = req.url === "/" ? "index.html" : `${req.url}/index.html`;
        const staticFilePath = path.join(__dirname, "dist/static", requestPath);

        if (fs.existsSync(staticFilePath)) {
          const content = fs.readFileSync(staticFilePath, "utf-8");
          res.setHeader("Content-Type", "text/html");
          res.setHeader("Cache-Control", "public, max-age=3600");
          return res.end(content);
        }

        next();
      });
    },
  };
}
