/**
 * Guest cart identity.
 *
 * Nexus owns the cart. For guests it issues the token and we must echo it back
 * on every cart request via the `x-cart-token` header. The contract
 * (`/api/public/cart`) only accepts `^[a-zA-Z0-9_-]{32,128}$`, so we never
 * invent a token locally — we store exactly what the server handed back.
 */
const CART_TOKEN_KEY = "miravika-cart-token";

/** Same character class and bounds the Nexus cart route validates against. */
export const CART_TOKEN_PATTERN = /^[a-zA-Z0-9_-]{32,128}$/;

export function isValidCartToken(token: string | null | undefined): token is string {
  return Boolean(token && CART_TOKEN_PATTERN.test(token));
}

export function getCartToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(CART_TOKEN_KEY);
    return isValidCartToken(stored) ? stored : null;
  } catch {
    // Private mode / storage blocked — fall back to a header-less guest cart.
    return null;
  }
}

export function setCartToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (isValidCartToken(token)) {
      window.localStorage.setItem(CART_TOKEN_KEY, token);
    } else {
      // Never persist a malformed token; the server re-issues one instead.
      window.localStorage.removeItem(CART_TOKEN_KEY);
    }
  } catch {
    /* storage unavailable — the cart still works, it just cannot resume a guest session */
  }
}

export function clearCartToken() {
  setCartToken(null);
}
