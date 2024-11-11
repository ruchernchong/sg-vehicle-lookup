import { z } from "zod";

export const plateSchema = z.object({
  plate: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{1,3}\s?\d{1,4}$/, "Invalid registration plate format"),
});

export const batchPlateSchema = z.object({
  plates: z
    .array(z.string())
    .min(1, "At least one plate is required")
    .max(100, "Maximum 100 plates per batch"),
});
