import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { lookup } from "@/lib/lookup";

const lookupRoutes = new Hono();

const schema = z.object({ vehicleNo: z.string() });

lookupRoutes.post("/:vehicleNo", zValidator("param", schema), async (c) => {
  const hours = new Date().getHours();

  if (hours >= 0 && hours < 6) {
    return c.json({
      message: "Service unavailable between 12 AM and 6 AM SGT.",
    });
  }

  const { vehicleNo } = c.req.param();

  try {
    const result = await lookup(vehicleNo);
    console.log(result);

    if (!result) {
      return c.json({ message: "No vehicle info found." });
    }

    return c.json({
      message: "Vehicle lookup is successful.",
      data: result,
    });
  } catch (e) {
    return c.json({ message: e.message }, 500);
  }
});

export { lookupRoutes };
