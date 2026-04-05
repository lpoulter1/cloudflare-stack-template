import { env } from "cloudflare:test";
import { describe, it, expect } from "vitest";
import app from "../index";

describe("GET /counter/:name", () => {
  it("increments a counter and returns the count", async () => {
    const res = await app.request("/counter/test-inc", {}, env);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ source: "Durable Object", name: "test-inc", count: 1 });
  });

  it("increments on each request", async () => {
    await app.request("/counter/test-multi", {}, env);
    const res = await app.request("/counter/test-multi", {}, env);
    const json = await res.json();
    expect(json.count).toBe(2);
  });

  it("tracks counters independently per name", async () => {
    await app.request("/counter/alpha", {}, env);
    await app.request("/counter/alpha", {}, env);
    await app.request("/counter/beta", {}, env);

    const alphaRes = await app.request("/counter/alpha/value", {}, env);
    const betaRes = await app.request("/counter/beta/value", {}, env);
    const alphaJson = await alphaRes.json();
    const betaJson = await betaRes.json();

    expect(alphaJson.count).toBe(2);
    expect(betaJson.count).toBe(1);
  });
});

describe("GET /counter/:name/value", () => {
  it("reads count without incrementing", async () => {
    await app.request("/counter/test-read", {}, env);
    const res = await app.request("/counter/test-read/value", {}, env);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ source: "Durable Object", name: "test-read", count: 1 });
  });
});
