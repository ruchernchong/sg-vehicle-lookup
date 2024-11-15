import { SPECIAL_PLATES } from "@/config/plates.config";
import { SpecialPlate } from "@/types";

export const getSpecialPlateInfo = (plate: string): SpecialPlate => {
  let series = plate.toUpperCase();

  Object.keys(SPECIAL_PLATES).some((specialPlate) => {
    if (new RegExp(specialPlate).test(plate)) {
      series = specialPlate;
    }
  });

  return SPECIAL_PLATES[series];
};
