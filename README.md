# Cloudflare Stack Template

A Hello World project demonstrating an end-to-end Cloudflare stack using [Hono](https://hono.dev/) on Workers with D1, KV, R2, and Durable Objects bindings.

**Live:** https://cloudflare-stack-template.lpoulter1984.workers.dev

## Stack

- **Workers** — serverless compute
- **D1** — SQLite database
- **KV** — key-value store
- **R2** — object storage
- **Durable Objects** — stateful coordination ([best practices](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/))
- **Hono** — lightweight web framework

## Project Structure

```
src/
  index.ts              — creates app, mounts sub-routes, exports default + Counter
  counter.ts            — Counter Durable Object class (SQLite-backed)
  routes/
    home.ts             — GET / (dashboard with live D1, KV, R2 data)
    messages.ts         — GET /db (D1 database query)
    cache.ts            — GET /kv (KV get/put)
    storage.ts          — GET /r2 (R2 object storage)
    counter.ts          — GET /counter/:name (Durable Object hit counter)
plans/
  plan.md               — roadmap, next steps, and stack comparison
wrangler.jsonc          — Cloudflare Workers config (JSONC format)
worker-configuration.d.ts — auto-generated binding types (via `wrangler types`)
vitest.config.mts       — test config using @cloudflare/vitest-pool-workers
```

## Routes

| Route | Description |
|-------|-------------|
| `GET /` | Dashboard with live data from D1, KV, and R2 |
| `GET /db` | D1 database query demo |
| `GET /kv` | KV get/put demo |
| `GET /r2` | R2 object storage demo |
| `GET /r2/:key` | Download an R2 object |
| `GET /counter/:name` | Durable Object counter — increment and return count |
| `GET /counter/:name/value` | Read counter without incrementing |

## Getting Started

```bash
pnpm install
pnpm db:migrate   # apply D1 schema locally
pnpm dev           # start dev server at localhost:8787
```

## Testing

Tests run inside the Workers runtime via [`@cloudflare/vitest-pool-workers`](https://developers.cloudflare.com/workers/testing/vitest-integration/) — no mocking needed, real D1/KV/R2 bindings are provided automatically.

```bash
pnpm test          # run all tests
pnpm test:watch    # watch mode
```

## Deploy

```bash
npx wrangler d1 migrations apply DB --remote   # apply migrations to production
pnpm deploy                                     # deploy to Cloudflare Workers
```

## Regenerate Types

After changing `wrangler.jsonc`, regenerate binding types:

```bash
npx wrangler types
```

## AI Tooling

### Cloudflare MCP Server

This project includes a `.mcp.json` config for the [Cloudflare MCP server](https://developers.cloudflare.com/agents/model-context-protocol/). When you open this project in Claude Code, you get access to Cloudflare management tools (Workers, D1, KV, R2) via natural language — query your database, inspect KV keys, list R2 objects, and more without leaving the terminal.

### Workers Best Practices Skill

This project includes a `workers-best-practices` Claude Code skill (in `skills/`) that reviews and authors Workers code against production best practices. It covers `wrangler.jsonc` config, binding types, route structure, streaming, error handling, and more. Use it by typing `/workers-best-practices` in Claude Code.

## Roadmap

See [plans/plan.md](plans/plan.md) for ideas on fleshing out the examples, additional Cloudflare services to add, project ideas, and a comparison of this stack vs Vercel+Supabase, AWS Lambda, and container-based alternatives.
