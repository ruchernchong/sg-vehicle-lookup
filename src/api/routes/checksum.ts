import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { plateSchema, batchPlateSchema } from "../schemas/checksum.schema";
import { formatChecksumResponse, formatBatchResponse } from "@/utils/responses";
import type { RegistrationPlate } from "@/types";
import { calculateChecksum } from "@/lib/checksum";

const checksumRoutes = new Hono();

checksumRoutes.get("/", zValidator("query", plateSchema), (c) => {
  const { plate } = c.req.query();
  const checksum = calculateChecksum(plate);
  return c.json(formatChecksumResponse(plate, checksum));
});

checksumRoutes.post(
  "/batch",
  zValidator("json", batchPlateSchema),
  async (c) => {
    const { plates } = await c.req.json<{ plates: string[] }>();
    const results = plates.map((plate) => {
      try {
        return {
          plate,
          checksum: calculateChecksum(plate as RegistrationPlate),
        };
      } catch (error) {
        return { plate, error: (error as Error).message };
      }
    });
    return c.json(formatBatchResponse(results));
  },
);

export { checksumRoutes };
