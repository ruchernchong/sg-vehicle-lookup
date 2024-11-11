import { describe, it, expect } from "vitest";
import { letterToNumber } from "../src/utils/letterToNumber";

describe("letterToNumber", () => {
  it("converts uppercase letters correctly", () => {
    expect(letterToNumber("A")).toBe(1);
    expect(letterToNumber("B")).toBe(2);
    expect(letterToNumber("M")).toBe(13);
    expect(letterToNumber("Z")).toBe(26);
  });

  it("converts lowercase letters correctly", () => {
    expect(letterToNumber("a")).toBe(1);
    expect(letterToNumber("b")).toBe(2);
    expect(letterToNumber("m")).toBe(13);
    expect(letterToNumber("z")).toBe(26);
  });

  it("throws error for empty string", () => {
    expect(() => letterToNumber("")).toThrow("Input must be a single letter");
  });

  it("throws error for multiple letters", () => {
    expect(() => letterToNumber("AB")).toThrow("Input must be a single letter");
  });

  it("throws error for non-letter characters", () => {
    expect(() => letterToNumber("1")).toThrow("Input must be a single letter");
    expect(() => letterToNumber("!")).toThrow("Input must be a single letter");
    expect(() => letterToNumber(" ")).toThrow("Input must be a single letter");
  });

  it("handles edge cases correctly", () => {
    expect(letterToNumber("A")).toBe(1);
    expect(letterToNumber("a")).toBe(1);

    expect(letterToNumber("Z")).toBe(26);
    expect(letterToNumber("z")).toBe(26);
  });
});
