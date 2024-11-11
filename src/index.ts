import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello from Cloudflare Workers!"));

export default app;
