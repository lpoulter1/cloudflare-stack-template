import { env } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../index";

describe("GET /db", () => {
  beforeEach(async () => {
    await env.DB.exec(
      "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))"
    );
    await env.DB.exec("DELETE FROM messages");
  });

  it("returns empty results when no messages exist", async () => {
    const res = await app.request("/db", {}, env);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ source: "D1", results: [] });
  });

  it("returns inserted messages", async () => {
    await env.DB.prepare("INSERT INTO messages (content) VALUES (?)").bind("hello").run();
    await env.DB.prepare("INSERT INTO messages (content) VALUES (?)").bind("world").run();

    const res = await app.request("/db", {}, env);
    const json = await res.json();
    expect(json.source).toBe("D1");
    expect(json.results).toHaveLength(2);
    const contents = json.results.map((r: any) => r.content);
    expect(contents).toContain("hello");
    expect(contents).toContain("world");
  });
});
