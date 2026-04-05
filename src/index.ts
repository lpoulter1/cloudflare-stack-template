import { Hono } from "hono";
import home from "./routes/home";
import messages from "./routes/messages";
import cache from "./routes/cache";
import storage from "./routes/storage";
import counter from "./routes/counter";

const app = new Hono<{ Bindings: Env }>();

app.route("/", home);
app.route("/db", messages);
app.route("/kv", cache);
app.route("/r2", storage);
app.route("/counter", counter);

export { Counter } from "./counter";
export default app;
