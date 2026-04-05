import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  await c.env.BUCKET.put("hello.txt", "Hello from R2!");
  const list = await c.env.BUCKET.list();
  const objects = list.objects.map((o) => ({
    key: o.key,
    size: o.size,
    uploaded: o.uploaded,
  }));
  return c.json({ source: "R2", objects });
});

export default app;
