import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

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
        <p class="muted">Live data from D1, KV, R2, and Durable Objects</p>

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
                      `<tr><td><a href="/r2/${encodeURIComponent(o.key)}">${o.key}</a></td><td>${o.size} B</td><td>${o.uploaded}</td></tr>`
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
          <li><a href="/counter/hello">/counter/:name</a> — Durable Object counter</li>
        </ul>
      </body>
    </html>
  `);
});

export default app;
