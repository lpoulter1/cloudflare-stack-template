import { Hono } from "hono";
import type { Counter } from "../counter";

const app = new Hono<{ Bindings: Env }>();

app.get("/:name", async (c) => {
  const name = c.req.param("name");
  const id = c.env.COUNTER.idFromName(name);
  const counter = c.env.COUNTER.get(id) as DurableObjectStub<Counter>;
  const count = await counter.increment();
  return c.json({ source: "Durable Object", name, count });
});

app.get("/:name/value", async (c) => {
  const name = c.req.param("name");
  const id = c.env.COUNTER.idFromName(name);
  const counter = c.env.COUNTER.get(id) as DurableObjectStub<Counter>;
  const count = await counter.getCount();
  return c.json({ source: "Durable Object", name, count });
});

export default app;
