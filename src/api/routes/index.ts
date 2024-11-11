import { Hono } from "hono";
import { checksumRoutes } from "./checksum";
import { healthRoutes } from "./health";
import { validateRoutes } from "./validate";

const routes = new Hono();

routes.route("/health", healthRoutes);
routes.route("/checksum", checksumRoutes);
routes.route("/validate", validateRoutes);

export { routes };
