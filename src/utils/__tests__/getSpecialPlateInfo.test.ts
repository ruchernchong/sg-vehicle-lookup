import { describe, it, expect } from "vitest";
import { getSpecialPlateInfo } from "../getSpecialPlateInfo";
import { SPECIAL_PLATES } from "@/config/plates.config";

describe("getSpecialPlateInfo", () => {
  it("should find exact matches", () => {
    expect(getSpecialPlateInfo("S1")).toBe(SPECIAL_PLATES.S1);
    expect(getSpecialPlateInfo("SPF1")).toBe(SPECIAL_PLATES.SPF1);
    expect(getSpecialPlateInfo("S/CD")).toBe(SPECIAL_PLATES["S/CD"]);
  });

  it("should be case insensitive", () => {
    expect(getSpecialPlateInfo("s1")).toBe(SPECIAL_PLATES.S1);
    expect(getSpecialPlateInfo("spf1")).toBe(SPECIAL_PLATES.SPF1);
    expect(getSpecialPlateInfo("s/cd")).toBe(SPECIAL_PLATES["S/CD"]);
  });

  it("should return undefined for non-matching plates", () => {
    expect(getSpecialPlateInfo("ABC123")).toBeUndefined();
    expect(getSpecialPlateInfo("RANDOM")).toBeUndefined();
    expect(getSpecialPlateInfo("")).toBeUndefined();
  });

  it("should handle special event plates", () => {
    expect(getSpecialPlateInfo("AIRSHOW")).toBe(SPECIAL_PLATES.AIRSHOW);
    expect(getSpecialPlateInfo("YOG")).toBe(SPECIAL_PLATES.YOG);
    expect(getSpecialPlateInfo("SGP")).toBe(SPECIAL_PLATES.SGP);
  });
});
