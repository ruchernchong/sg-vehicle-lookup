import { Hono } from "hono";
import { checksumRoutes } from "./checksum";
import { validateRoutes } from "./validate";
import { lookupRoutes } from "./lookup";

const routes = new Hono();

routes.route("/checksum", checksumRoutes);
routes.route("/validate", validateRoutes);
routes.route("/lookup", lookupRoutes);

export { routes };
