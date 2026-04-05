import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  await c.env.CACHE.put("hello", "world from KV!");
  const value = await c.env.CACHE.get("hello");
  return c.json({ source: "KV", key: "hello", value });
});

export default app;
