import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { validateLicensePlate } from "@/lib/validator";

const validateRoutes = new Hono();

const schema = z.object({
  plate: z.string().min(1, "License plate is required"),
});

validateRoutes.get("/", zValidator("query", schema), (c) => {
  const { plate } = c.req.query();

  const { isValid, message } = validateLicensePlate(plate);

  return c.json({
    success: true,
    data: { isValid, message, plate },
  });
});

export { validateRoutes };
