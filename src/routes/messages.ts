import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM messages ORDER BY created_at DESC LIMIT 10"
  ).all();
  return c.json({ source: "D1", results });
});

export default app;
