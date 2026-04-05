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

app.get("/:key", async (c) => {
  const object = await c.env.BUCKET.get(c.req.param("key"));
  if (!object) {
    return c.notFound();
  }
  c.header("Content-Type", object.httpMetadata?.contentType ?? "application/octet-stream");
  c.header("Content-Disposition", `attachment; filename="${c.req.param("key")}"`);
  return c.body(object.body);
});

export default app;
