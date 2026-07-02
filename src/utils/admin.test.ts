import { describe, it, expect } from "vitest";
import { checkIsAdmin } from "./admin";

describe("checkIsAdmin", () => {
  it("returns false if user is null", () => {
    expect(checkIsAdmin(null, [], "")).toBe(false);
  });

  it("returns false if user has no email", () => {
    expect(checkIsAdmin({ uid: "123", email: "" }, [], "")).toBe(false);
  });

  it("returns true if user is in adminsList", () => {
    const user = { uid: "123", email: "admin@example.com" };
    expect(checkIsAdmin(user, ["admin@example.com", "other@example.com"], "")).toBe(true);
  });

  it("returns true if user email is in defaultAdminsStr", () => {
    const user = { uid: "123", email: "super@admin.com" };
    expect(checkIsAdmin(user, [], "super@admin.com, other@admin.com")).toBe(true);
  });

  it("returns true if user has isAdmin flag", () => {
    const user = { uid: "123", email: "user@example.com", isAdmin: true };
    expect(checkIsAdmin(user, [], "")).toBe(true);
  });

  it("is case-insensitive for email checks", () => {
    const user = { uid: "123", email: "Admin@Example.com" };
    expect(checkIsAdmin(user, ["admin@example.com"], "")).toBe(true);
    expect(checkIsAdmin(user, [], "ADMIN@EXAMPLE.COM")).toBe(true);
  });

  it("returns false if user is a normal user", () => {
    const user = { uid: "123", email: "user@example.com" };
    expect(checkIsAdmin(user, ["admin@example.com"], "super@admin.com")).toBe(false);
  });
});
