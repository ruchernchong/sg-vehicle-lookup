import { describe, expect, it } from "vitest";
import { validateLicensePlate } from "../validator";

describe("validateLicensePlate", () => {
  it("should validate correct format with 3 letters prefix", () => {
    const result = validateLicensePlate("SBA1234G");
    expect(result.isValid).toBe(true);
  });

  it("should validate correct format with 2 letters prefix", () => {
    const result = validateLicensePlate("SG123Z");
    expect(result.isValid).toBe(true);
  });

  it("should validate with minimum numbers (1)", () => {
    const result = validateLicensePlate("AB1Z");
    expect(result.isValid).toBe(false); // Should fail as total length < 5
  });

  it("should validate with maximum numbers (4)", () => {
    const result = validateLicensePlate("AB1234Z");
    expect(result.isValid).toBe(true);
  });

  it("should handle spaces correctly", () => {
    const result = validateLicensePlate("SBA 1234 G");
    expect(result.isValid).toBe(true);
  });

  it("should handle lowercase input", () => {
    const result = validateLicensePlate("sba1234g");
    expect(result.isValid).toBe(true);
  });

  // Invalid formats
  it("should reject empty string", () => {
    const result = validateLicensePlate("");
    expect(result.isValid).toBe(false);
    expect(result.message).toBe("License plate cannot be empty");
  });

  it("should reject too many letters in prefix", () => {
    const result = validateLicensePlate("ABCD123Z");
    expect(result.isValid).toBe(false);
  });

  it("should reject missing check letter", () => {
    const result = validateLicensePlate("sba1234");
    expect(result.isValid).toBe(false);
  });

  it("should reject too many numbers", () => {
    const result = validateLicensePlate("SBA12345G");
    expect(result.isValid).toBe(false);
  });

  it("should reject wrong format (numbers first)", () => {
    const result = validateLicensePlate("123ABCZ");
    expect(result.isValid).toBe(false);
  });
});
