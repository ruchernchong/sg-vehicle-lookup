import { Hono } from "hono";
import { z } from "zod";
import { lookup } from "../../lib/lookup";
import { zValidator } from "@hono/zod-validator";

const lookupRoutes = new Hono();

const schema = z.object({ vehicleNo: z.string() });

lookupRoutes.post("/:vehicleNo", zValidator("param", schema), async (c) => {
  const { vehicleNo } = c.req.param();

  try {
    const result = await lookup(vehicleNo);
    console.log(result);

    if (result) {
      return c.json(result);
    }

    return c.json({});
  } catch (e) {
    throw new Error(e.message);
  }
});

export { lookupRoutes };
