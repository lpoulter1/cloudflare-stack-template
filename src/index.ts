import { Hono } from "hono";
import home from "./routes/home";
import messages from "./routes/messages";
import cache from "./routes/cache";
import storage from "./routes/storage";

const app = new Hono<{ Bindings: Env }>();

app.route("/", home);
app.route("/db", messages);
app.route("/kv", cache);
app.route("/r2", storage);

export default app;
