# Cloudflare Stack Template

A Hello World project demonstrating an end-to-end Cloudflare stack using [Hono](https://hono.dev/) on Workers with D1, KV, and R2 bindings.

**Live:** https://cloudflare-stack-template.lpoulter1984.workers.dev

## Stack

- **Workers** — serverless compute
- **D1** — SQLite database
- **KV** — key-value store
- **R2** — object storage
- **Hono** — lightweight web framework

## Project Structure

```
src/
  index.ts              — creates app, mounts sub-routes, exports default
  routes/
    home.ts             — GET / (dashboard with live D1, KV, R2 data)
    messages.ts         — GET /db (D1 database query)
    cache.ts            — GET /kv (KV get/put)
    storage.ts          — GET /r2 (R2 object storage)
wrangler.jsonc          — Cloudflare Workers config (JSONC format)
worker-configuration.d.ts — auto-generated binding types (via `wrangler types`)
```

## Routes

| Route | Description |
|-------|-------------|
| `GET /` | Dashboard with live data from D1, KV, and R2 |
| `GET /db` | D1 database query demo |
| `GET /kv` | KV get/put demo |
| `GET /r2` | R2 object storage demo |

## Getting Started

```bash
pnpm install
pnpm db:migrate   # apply D1 schema locally
pnpm dev           # start dev server at localhost:8787
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

## Cloudflare MCP

This project includes a `.mcp.json` config for the [Cloudflare MCP server](https://developers.cloudflare.com/agents/model-context-protocol/). When you open this project in Claude Code, you get access to Cloudflare management tools (Workers, D1, KV, R2) via natural language.
