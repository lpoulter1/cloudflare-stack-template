import { DurableObject } from "cloudflare:workers";

export class Counter extends DurableObject<Env> {
  sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    ctx.blockConcurrencyWhile(async () => {
      this.sql.exec(
        "CREATE TABLE IF NOT EXISTS counts (id INTEGER PRIMARY KEY, hits INTEGER NOT NULL DEFAULT 0)"
      );
      this.sql.exec("INSERT OR IGNORE INTO counts (id, hits) VALUES (1, 0)");
    });
  }

  async increment(): Promise<number> {
    const row = this.sql.exec(
      "UPDATE counts SET hits = hits + 1 WHERE id = 1 RETURNING hits"
    ).one();
    return row.hits as number;
  }

  async getCount(): Promise<number> {
    const row = this.sql.exec("SELECT hits FROM counts WHERE id = 1").one();
    return row.hits as number;
  }
}
