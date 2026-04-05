// Cloudflare Worker entry point using Hono as the routing framework.
// `export default app` at the bottom is what the Workers runtime invokes on each request.
import { Hono } from "hono";

// Binding types injected by the Workers runtime based on wrangler.toml configuration.
// DB  → D1 relational database
// CACHE → KV key-value store
// BUCKET → R2 object storage
type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  BUCKET: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

// Landing page — fetches live data from all three bindings to demonstrate the full stack.
app.get("/", async (c) => {
  const [dbResult, kvValue, r2List] = await Promise.all([
    c.env.DB.prepare(
      "SELECT * FROM messages ORDER BY created_at DESC LIMIT 5"
    ).all(),
    c.env.CACHE.get("hello"),
    c.env.BUCKET.list(),
  ]);

  const messages = dbResult.results;
  const objects = r2List.objects;

  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cloudflare Stack Template</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 700px; margin: 2rem auto; padding: 0 1rem; }
          h1 { margin-bottom: 0.25rem; }
          h2 { margin-top: 1.5rem; }
          table { border-collapse: collapse; width: 100%; }
          th, td { text-align: left; padding: 0.4rem 0.75rem; border-bottom: 1px solid #ddd; }
          code { background: #f3f3f3; padding: 0.15rem 0.35rem; border-radius: 3px; }
          .muted { color: #666; }
          a { color: #e06c00; }
        </style>
      </head>
      <body>
        <h1>Cloudflare Stack Template</h1>
        <p class="muted">Live data from D1, KV, and R2 bindings</p>

        <h2>D1 — Recent Messages</h2>
        ${
          messages.length
            ? `<table>
                <tr><th>ID</th><th>Content</th><th>Created</th></tr>
                ${messages
                  .map(
                    (m: any) =>
                      `<tr><td>${m.id}</td><td>${m.content}</td><td>${m.created_at}</td></tr>`
                  )
                  .join("")}
              </table>`
            : "<p class='muted'>No messages yet. POST to <code>/db</code> to add one.</p>"
        }

        <h2>KV — Cached Value</h2>
        <p><code>hello</code> → ${kvValue !== null ? `<code>${kvValue}</code>` : "<span class='muted'>not set yet — visit <a href=\"/kv\">/kv</a> to seed it</span>"}</p>

        <h2>R2 — Stored Objects</h2>
        ${
          objects.length
            ? `<table>
                <tr><th>Key</th><th>Size</th><th>Uploaded</th></tr>
                ${objects
                  .map(
                    (o) =>
                      `<tr><td>${o.key}</td><td>${o.size} B</td><td>${o.uploaded}</td></tr>`
                  )
                  .join("")}
              </table>`
            : "<p class='muted'>No objects yet. Visit <a href=\"/r2\">/r2</a> to create one.</p>"
        }

        <h2>JSON API Endpoints</h2>
        <ul>
          <li><a href="/db">/db</a> — D1 messages</li>
          <li><a href="/kv">/kv</a> — KV read/write</li>
          <li><a href="/r2">/r2</a> — R2 list</li>
        </ul>
      </body>
    </html>
  `);
});

// D1 route — queries the relational database for recent messages.
app.get("/db", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM messages ORDER BY created_at DESC LIMIT 10"
  ).all();
  return c.json({ source: "D1", results });
});

// KV route — writes then reads a key to demonstrate the key-value store.
app.get("/kv", async (c) => {
  await c.env.CACHE.put("hello", "world from KV!");
  const value = await c.env.CACHE.get("hello");
  return c.json({ source: "KV", key: "hello", value });
});

// R2 route — writes an object then lists the bucket contents.
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
