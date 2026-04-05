# Roadmap & Next Steps

Ideas for expanding this template into a more complete Cloudflare stack demo.

---

## 1. Flesh out existing examples

### Messages (D1) — full CRUD
Currently `/db` only reads. Add:
- `POST /db` — create a message (JSON body `{ content: "..." }`)
- `DELETE /db/:id` — delete a message
- Add a form to the dashboard so messages can be posted from the UI

This demonstrates D1's write path: parameterized statements, inserts, deletes.

### Cache (KV) — realistic caching
Currently `/kv` writes and reads a hardcoded key. Instead:
- Use KV as a cache in front of D1 (e.g., cache the message list with a TTL)
- Add `PUT /kv/:key` and `DELETE /kv/:key` for full KV API coverage
- Demonstrate `expirationTtl` for auto-expiry

### Storage (R2) — file uploads
Currently `/r2` writes a hardcoded string. Instead:
- `POST /r2` — accept file uploads via `multipart/form-data`
- `DELETE /r2/:key` — delete objects
- Show `httpMetadata` (content-type) on upload

---

## 2. Additional Cloudflare services to consider

### Tier 1 — High value, easy to add
| Service | What it does | How it fits |
|---------|-------------|-------------|
| **Cron Triggers** | Scheduled execution (e.g., every hour) | Cleanup old messages, rotate KV cache, generate reports |
| **Queues** | Async message processing | Decouple writes — POST /db enqueues, a consumer writes to D1 |
| **Workers AI** | Run ML models at the edge | Summarize messages, generate content, classify uploads |

### Tier 2 — More specialized
| Service | What it does | How it fits |
|---------|-------------|-------------|
| **Durable Objects** | Stateful, single-instance coordination | Real-time: chat rooms, collaborative editing, rate limiting |
| **Vectorize** | Vector database | Semantic search over messages (pair with Workers AI embeddings) |
| **Hyperdrive** | Connection pooling for external Postgres | When you outgrow D1 and need full Postgres |
| **Email Workers** | Receive/process email | Inbound email -> parse -> store in D1 |

### Tier 3 — Infrastructure
| Service | What it does |
|---------|-------------|
| **Workflows** | Multi-step, durable execution with retries and sleep |
| **Browser Rendering** | Headless Chrome for screenshots, PDF generation |
| **mTLS / API Shield** | Client certificate auth for API security |

---

## 3. What to build with this stack

D1 + KV + R2 = a database, a cache, and a file store — the three pillars of most web apps.

| Project idea | D1 role | KV role | R2 role |
|-------------|---------|---------|---------|
| **Link shortener** | URLs + click analytics | Cache hot redirects | — |
| **Pastebin** | Metadata, accounts | Rate limiting | Raw paste content |
| **Image gallery** | Image metadata, tags | Thumbnail cache | Image files |
| **Blog / CMS** | Posts, comments, users | Page cache with TTL | Media uploads |
| **API with webhooks** | Event log, config | Dedup / idempotency cache | Payload archive |
| **Simple SaaS** | Multi-tenant data | Session store, feature flags | User uploads |

### What does NOT fit well
- **Heavy relational queries** — D1 is SQLite, no cross-shard JOINs, ~10M row practical limit
- **Long-running compute** — 30s CPU limit (use Workflows or Queues)
- **WebSocket-heavy apps** — needs Durable Objects, adds complexity
- **Large file processing** — R2 streams well but Workers have 128MB memory

---

## 4. Pairing with a frontend

This Workers API is a **backend** — it can be called from any frontend framework. Some natural pairings:

| Frontend | Where it runs | Notes |
|----------|--------------|-------|
| **Next.js (Vercel)** | Vercel edge/serverless | Next.js handles SSR/RSC, calls Workers API for data |
| **Next.js (Cloudflare)** | CF Pages via `@opennextjs/cloudflare` | Full-stack on Cloudflare, same platform as the API |
| **React SPA / Vite** | CF Pages or any CDN | Static build, fetches from Workers API |
| **Astro** | CF Pages | Great for content sites, can call Workers API at build or runtime |
| **SvelteKit** | CF Pages | First-class Cloudflare adapter |
| **Mobile / native** | Device | Workers API serves JSON, works like any REST backend |

The key insight: Workers + D1/KV/R2 replaces the **backend + database layer**, not the frontend. You're free to pick any frontend and deploy it anywhere.

### Cloudflare Pages + Workers (full-stack on CF)

If you want everything on Cloudflare, Pages can host the frontend and use the same D1/KV/R2 bindings directly — no separate API needed. But keeping the API as a standalone Worker gives you a clean separation and lets different frontends share the same backend.

## 5. Backend comparison (Workers vs alternatives)

These comparisons are about the **backend** layer specifically — what serves your API and manages your data.

### vs Supabase (BaaS)
| | Workers + D1/KV/R2 | Supabase |
|---|---|---|
| **Control** | Full — you write the API logic | Less — auto-generated REST/GraphQL from schema |
| **Database** | D1 (SQLite, edge reads) | Postgres (full SQL, single region) |
| **Auth** | DIY or third-party | Built-in auth, RLS policies |
| **Realtime** | Needs Durable Objects | Built-in realtime subscriptions |
| **Best for** | Custom APIs, edge-first | Rapid prototyping, auth-heavy apps |

### vs AWS Lambda + DynamoDB + S3
| | Workers + D1/KV/R2 | AWS |
|---|---|---|
| **Complexity** | Single config file, one deploy | IAM, API Gateway, CloudFormation |
| **Cold starts** | ~0ms | 100ms–seconds |
| **Cost** | Predictable, cheap | Can surprise (API Gateway, DynamoDB RCU) |
| **Vendor lock-in** | Moderate (SQLite, S3-compatible R2) | High (DynamoDB is proprietary) |
| **Best for** | Small-to-medium, edge-first | Enterprise, complex architectures |

### vs containers (Railway / Fly.io)
| | Workers | Containers |
|---|---|---|
| **Model** | V8 isolates (no OS) | Full Linux container |
| **Flexibility** | JS/TS/Wasm only | Any language |
| **Scaling** | Automatic, per-request, global | Manual/auto, region-specific |
| **Best for** | Stateless APIs | Stateful apps, background workers, legacy code |

### Key strengths
1. **Global by default** — 300+ cities, no region selection
2. **Zero cold starts** — V8 isolates spin up in <1ms
3. **Unified platform** — DB, cache, storage, AI, queues in one config
4. **S3-compatible R2** — no egress fees
5. **Price** — free tier covers most hobby projects

### Key trade-offs
1. **D1 is SQLite** — no stored procedures, limited concurrent writers
2. **128MB memory** — can't load large datasets
3. **30s CPU time** — long tasks need Queues or Workflows
4. **Ecosystem** — fewer ORMs/libraries vs AWS/Vercel
5. **Debugging** — `wrangler dev` is good but less mature than local Node.js
