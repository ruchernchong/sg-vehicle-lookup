import { SPECIAL_PLATES } from "@/config/plates.config";
import { SpecialPlate } from "@/types";

/**
 * Returns information about a special vehicle license plate number.
 * Performs a case-insensitive match against known special plates.
 *
 * @param plate - The license plate number to look up
 * @returns The matching special plate info, or undefined if no match found
 */
export const getSpecialPlateInfo = (plate: string): SpecialPlate => {
  let series = plate.toUpperCase();

  Object.keys(SPECIAL_PLATES).some((specialPlate) => {
    if (new RegExp(specialPlate).test(plate)) {
      series = specialPlate;
    }
  });

  return SPECIAL_PLATES[series];
};
