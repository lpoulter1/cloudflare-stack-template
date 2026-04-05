import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  BUCKET: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head><title>Cloudflare Stack Template</title></head>
      <body>
        <h1>Hello World from Cloudflare Workers!</h1>
        <ul>
          <li><a href="/db">D1 Database</a></li>
          <li><a href="/kv">KV Store</a></li>
          <li><a href="/r2">R2 Storage</a></li>
        </ul>
      </body>
    </html>
  `);
});

app.get("/db", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM messages ORDER BY created_at DESC LIMIT 10"
  ).all();
  return c.json({ source: "D1", results });
});

app.get("/kv", async (c) => {
  await c.env.CACHE.put("hello", "world from KV!");
  const value = await c.env.CACHE.get("hello");
  return c.json({ source: "KV", key: "hello", value });
});

app.get("/r2", async (c) => {
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
