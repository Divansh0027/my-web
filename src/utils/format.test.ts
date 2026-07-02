import { describe, it, expect } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("formats crores correctly", () => {
    expect(formatPrice(10000000)).toBe("₹1 Crore");
    expect(formatPrice(15000000)).toBe("₹1.50 Crore");
    expect(formatPrice(12340000)).toBe("₹1.23 Crore");
    expect(formatPrice(10000000, true)).toBe("₹1 Cr");
  });

  it("formats lakhs correctly", () => {
    expect(formatPrice(100000)).toBe("₹1 Lakhs");
    expect(formatPrice(150000)).toBe("₹1.5 Lakhs");
    expect(formatPrice(120000)).toBe("₹1.2 Lakhs");
    expect(formatPrice(100000, true)).toBe("₹1 L");
  });

  it("formats thousands correctly", () => {
    expect(formatPrice(50000)).toBe("₹50,000");
    expect(formatPrice(1000)).toBe("₹1,000");
  });
});
