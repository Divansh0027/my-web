import { describe, it, expect } from "vitest";
import { validatePropertyStep1, validatePropertyStep2 } from "./validation";

describe("validatePropertyStep1", () => {
  it("returns null for valid inputs", () => {
    expect(validatePropertyStep1("Beautiful Villa in Suburbs", "This is a very long and detailed description for a beautiful villa located in the suburbs, which has amazing amenities.", "South Extension")).toBeNull();
  });

  it("fails if title is too short", () => {
    expect(validatePropertyStep1("Short", "This is a very long and detailed description for a beautiful villa located in the suburbs, which has amazing amenities.", "South Extension")).toBe("Title must be at least 10 characters long to guide buyers.");
  });

  it("fails if description is too short", () => {
    expect(validatePropertyStep1("Beautiful Villa in Suburbs", "Short desc", "South Extension")).toBe("Please write a comprehensive description (at least 30 characters).");
  });

  it("fails if locality is empty", () => {
    expect(validatePropertyStep1("Beautiful Villa in Suburbs", "This is a very long and detailed description for a beautiful villa located in the suburbs, which has amazing amenities.", "")).toBe("Locality coordinates cannot be empty.");
  });
});

describe("validatePropertyStep2", () => {
  it("returns null for valid inputs", () => {
    expect(validatePropertyStep2("1000000", "1500")).toBeNull();
    expect(validatePropertyStep2(1000000, 1500)).toBeNull();
  });

  it("fails for invalid price", () => {
    expect(validatePropertyStep2("", "1500")).toBe("Please enter a valid positive property price.");
    expect(validatePropertyStep2("0", "1500")).toBe("Please enter a valid positive property price.");
    expect(validatePropertyStep2("-50", "1500")).toBe("Please enter a valid positive property price.");
    expect(validatePropertyStep2("abc", "1500")).toBe("Please enter a valid positive property price.");
  });

  it("fails for invalid area", () => {
    expect(validatePropertyStep2("1000000", "")).toBe("Please specify a valid property area.");
    expect(validatePropertyStep2("1000000", "0")).toBe("Please specify a valid property area.");
    expect(validatePropertyStep2("1000000", "-10")).toBe("Please specify a valid property area.");
    expect(validatePropertyStep2("1000000", "xyz")).toBe("Please specify a valid property area.");
  });
});
