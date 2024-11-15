import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { timing } from "hono/timing";
import { errorHandler } from "@/api/middleware/errorHandler";
import { routes } from "@/api/routes";

process.env.TZ = "Asia/Singapore";

const app = new Hono();

app.use(logger());
app.use(prettyJSON());
app.use(timing());

app.onError(errorHandler);

app.route("/", routes);

export const handler = handle(app);
