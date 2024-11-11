import { Hono } from "hono";

const healthRoutes = new Hono();

healthRoutes.get("/", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

export { healthRoutes };
