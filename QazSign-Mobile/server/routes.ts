import type { Express } from "express";
import { createServer, type Server } from "node:http";

const PYTHON_API_URL = "http://localhost:5001";

async function proxyToPython(
  endpoint: string,
  method: string,
  body?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const response = await fetch(`${PYTHON_API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Python API error: ${response.status}`);
  }

  return response.json();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/ai/predict", async (req, res) => {
    try {
      const { image, session_id = "default" } = req.body;

      if (!image) {
        return res.status(400).json({ error: "No image data provided" });
      }

      const result = await proxyToPython("/predict", "POST", {
        image,
        session_id,
      });

      res.json(result);
    } catch (error) {
      console.error("AI prediction error:", error);
      res.status(500).json({ error: "AI prediction failed" });
    }
  });

  app.post("/api/ai/reset", async (req, res) => {
    try {
      const { session_id = "default" } = req.body || {};
      const result = await proxyToPython("/reset", "POST", { session_id });
      res.json(result);
    } catch (error) {
      console.error("AI reset error:", error);
      res.json({ status: "reset", session_id: req.body?.session_id || "default" });
    }
  });

  app.get("/api/ai/health", async (req, res) => {
    try {
      const result = await proxyToPython("/health", "GET");
      res.json(result);
    } catch (error) {
      res.json({ status: "error", message: "Python server not available" });
    }
  });

  app.get("/api/ai/actions", async (req, res) => {
    try {
      const result = await proxyToPython("/actions", "GET");
      res.json(result);
    } catch (error) {
      const actions = [
        "сәлеметсіз бе",
        "сау болыңыз",
        "аты",
        "тегі",
        "әкесінің аты",
        "бір",
        "мектеп",
      ];
      res.json({ actions });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
