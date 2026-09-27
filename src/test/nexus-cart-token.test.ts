import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CART_TOKEN_PATTERN,
  clearCartToken,
  getCartToken,
  isValidCartToken,
  setCartToken,
} from "../lib/nexus-cart-token";

const KEY = "miravika-cart-token";

/** Nexus issues two concatenated UUIDs with the dashes stripped (64 chars). */
const SERVER_TOKEN = "a".repeat(32) + "b".repeat(32);

describe("nexus-cart-token", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("accepts the token format Nexus issues", () => {
    expect(isValidCartToken(SERVER_TOKEN)).toBe(true);
    expect(CART_TOKEN_PATTERN.test(SERVER_TOKEN)).toBe(true);
  });

  it("rejects tokens that violate the Nexus contract", () => {
    // Too short, too long, and characters outside [a-zA-Z0-9_-] are all refused.
    expect(isValidCartToken("a".repeat(31))).toBe(false);
    expect(isValidCartToken("a".repeat(129))).toBe(false);
    expect(isValidCartToken("a".repeat(32) + "!" + "b".repeat(31))).toBe(false);
    expect(isValidCartToken("")).toBe(false);
    expect(isValidCartToken(null)).toBe(false);
    expect(isValidCartToken(undefined)).toBe(false);
  });

  it("round-trips a server-issued token through storage", () => {
    setCartToken(SERVER_TOKEN);
    expect(window.localStorage.getItem(KEY)).toBe(SERVER_TOKEN);
    expect(getCartToken()).toBe(SERVER_TOKEN);
  });

  it("never persists a malformed token", () => {
    window.localStorage.setItem(KEY, "too-short");
    expect(getCartToken()).toBeNull();

    setCartToken("still-not-valid");
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });

  it("clears the stored token", () => {
    setCartToken(SERVER_TOKEN);
    clearCartToken();
    expect(getCartToken()).toBeNull();
  });

  it("degrades safely when storage throws", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(getCartToken()).toBeNull();
    spy.mockRestore();

    const setSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => setCartToken(SERVER_TOKEN)).not.toThrow();
    setSpy.mockRestore();
  });
});
