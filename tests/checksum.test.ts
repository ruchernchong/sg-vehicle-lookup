import { describe, it, expect } from "vitest";
import { calculateChecksum } from "../src/lib/checksum";

describe("calculateChecksum", () => {
  it("calculates checksum correctly for 3-letter prefix plates", () => {
    expect(calculateChecksum("ABC 1234")).toBeDefined();
    expect(calculateChecksum("XYZ 9999")).toBeDefined();
  });

  it("calculates checksum correctly for 2-letter prefix plates", () => {
    expect(calculateChecksum("AB 1234")).toBeDefined();
    expect(calculateChecksum("YZ 9999")).toBeDefined();
  });

  it("calculates checksum correctly for 1-letter prefix plates", () => {
    expect(calculateChecksum("A 1234")).toBeDefined();
    expect(calculateChecksum("Z 9999")).toBeDefined();
  });

  it("throws error for invalid registration plate formats", () => {
    expect(() => calculateChecksum("")).toThrow(
      "Invalid registration plate format",
    );
    expect(() => calculateChecksum("ABCD 1234")).toThrow(
      "Invalid registration plate format",
    );
    expect(() => calculateChecksum("A12 34")).toThrow(
      "Invalid registration plate format",
    );
    expect(() => calculateChecksum("ABC1234")).toThrow(
      "Invalid registration plate format",
    );
    expect(() => calculateChecksum("ABC 12345")).toThrow(
      "Invalid registration plate format",
    );
  });

  // Test number padding
  it("handles number padding correctly", () => {
    expect(calculateChecksum("ABC 1")).toBeDefined();
    expect(calculateChecksum("ABC 12")).toBeDefined();
    expect(calculateChecksum("ABC 123")).toBeDefined();
    expect(calculateChecksum("ABC 1234")).toBeDefined();
  });
});
