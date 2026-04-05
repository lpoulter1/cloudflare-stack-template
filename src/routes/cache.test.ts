import { env } from "cloudflare:test";
import { describe, it, expect } from "vitest";
import app from "../index";

describe("GET /kv", () => {
  it("writes and reads a KV value", async () => {
    const res = await app.request("/kv", {}, env);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      source: "KV",
      key: "hello",
      value: "world from KV!",
    });
  });

  it("persists the value in KV", async () => {
    await app.request("/kv", {}, env);
    const value = await env.CACHE.get("hello");
    expect(value).toBe("world from KV!");
  });
});
