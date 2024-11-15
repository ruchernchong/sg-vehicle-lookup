import { Hono } from "hono";
import { routes } from "./api/routes";
import { errorHandler } from "./api/middleware/errorHandler";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { timing } from "hono/timing";
import { handle } from "hono/aws-lambda";

const app = new Hono();

app.use(logger());
app.use(prettyJSON());
app.use(timing());

app.onError(errorHandler);

app.route("/", routes);

export const handler = handle(app);
