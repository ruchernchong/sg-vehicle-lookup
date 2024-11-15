import { describe, it, expect } from "vitest";
import { normaliseWhitespace } from "../normaliseWhitespace";

describe("normaliseWhitespace", () => {
  it("should handle empty string", () => {
    expect(normaliseWhitespace("")).toBe("");
  });

  it("should remove tabs and newlines", () => {
    expect(normaliseWhitespace("hello\tworld\ntest")).toBe("hello world test");
  });

  it("should collapse multiple spaces", () => {
    expect(normaliseWhitespace("hello    world")).toBe("hello world");
  });

  it("should trim leading/trailing whitespace", () => {
    expect(normaliseWhitespace("  hello world  ")).toBe("hello world");
  });

  it("should handle complex mixed whitespace", () => {
    expect(normaliseWhitespace("  hello\t\n world  \n\t test  ")).toBe(
      "hello world test",
    );
  });
});
