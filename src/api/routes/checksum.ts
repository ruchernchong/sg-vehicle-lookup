import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { plateSchema } from "../schemas/checksum.schema";
import { calculateChecksum } from "@/lib/checksum";
import { getSpecialPlateInfo } from "@/utils/getSpecialPlateInfo";

const checksumRoutes = new Hono();

checksumRoutes.get("/", zValidator("query", plateSchema), (c) => {
  const { plate } = c.req.query();

  const specialPlate = getSpecialPlateInfo(plate);
  if (specialPlate) {
    return c.json({
      isSpecialPlate: true,
      plate,
      description: specialPlate.description,
      category: specialPlate.category,
      checksum:
        "Special registration numbers are excluded from checksum calculation",
      vehicleNo: specialPlate.plate,
    });
  }

  const checksum = calculateChecksum(plate);
  const vehicleNo = plate + checksum;

  return c.json({ isSpecialPlate: false, plate, checksum, vehicleNo });
});

export { checksumRoutes };
