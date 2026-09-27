import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyNexusPayment = vi.fn();

vi.mock("../lib/nexus", () => ({
  verifyNexusPayment: (...args: unknown[]) => verifyNexusPayment(...args),
}));

const { completeVerifiedPayment, createSubmissionGuard, isRetryableVerificationFailure } =
  await import("../lib/payment-completion");

const PROOF = {
  razorpay_order_id: "order_test_1",
  razorpay_payment_id: "pay_test_1",
  razorpay_signature: "sig_abcdef123456",
};

const VERIFICATION = { order_number: "MIR-1001", status: "PAID", duplicate: false };

describe("completeVerifiedPayment", () => {
  beforeEach(() => {
    verifyNexusPayment.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("verifies with Nexus and reports success", async () => {
    verifyNexusPayment.mockResolvedValue(VERIFICATION);
    const clearCart = vi.fn().mockResolvedValue(undefined);
    const syncCart = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    await completeVerifiedPayment({ proof: PROOF, clearCart, syncCart, onSuccess });

    // The proof is forwarded verbatim; the browser never decides "paid".
    expect(verifyNexusPayment).toHaveBeenCalledWith(PROOF);
    expect(onSuccess).toHaveBeenCalledWith(VERIFICATION);
  });

  it("clears the server cart and then re-reads it after a verified payment", async () => {
    const order: string[] = [];
    verifyNexusPayment.mockResolvedValue(VERIFICATION);
    const clearCart = vi.fn(async () => {
      order.push("clear");
    });
    const syncCart = vi.fn(async () => {
      order.push("sync");
    });

    await completeVerifiedPayment({
      proof: PROOF,
      clearCart,
      syncCart,
      onSuccess: () => order.push("success"),
    });

    // Refresh happens after cleanup, and never before the payment is confirmed.
    expect(order).toEqual(["clear", "sync", "success"]);
  });

  it("still reports success when cart cleanup fails (cart_cleanup_pending)", async () => {
    verifyNexusPayment.mockResolvedValue(VERIFICATION);
    const clearCart = vi.fn().mockRejectedValue(new Error("cart_cleanup_pending"));
    const syncCart = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    await expect(
      completeVerifiedPayment({ proof: PROOF, clearCart, syncCart, onSuccess }),
    ).resolves.toBeUndefined();

    // Payment succeeded, so the customer must see the thank-you path.
    expect(onSuccess).toHaveBeenCalledWith(VERIFICATION);
    expect(syncCart).toHaveBeenCalled();
  });

  it("still reports success when the post-payment cart refresh fails", async () => {
    verifyNexusPayment.mockResolvedValue(VERIFICATION);
    const clearCart = vi.fn().mockResolvedValue(undefined);
    const syncCart = vi.fn().mockRejectedValue(new Error("CART_UNAVAILABLE"));
    const onSuccess = vi.fn();

    await completeVerifiedPayment({ proof: PROOF, clearCart, syncCart, onSuccess });

    expect(onSuccess).toHaveBeenCalledWith(VERIFICATION);
  });

  it("does not report success when verification itself fails", async () => {
    const failure = Object.assign(new Error("We could not verify this payment."), {
      code: "SIGNATURE_INVALID",
    });
    verifyNexusPayment.mockRejectedValue(failure);

    const clearCart = vi.fn();
    const syncCart = vi.fn();
    const onSuccess = vi.fn();

    await expect(
      completeVerifiedPayment({ proof: PROOF, clearCart, syncCart, onSuccess }),
    ).rejects.toThrow("We could not verify this payment.");

    // Nothing is cleared and no purchase is reported for an unverified payment.
    expect(clearCart).not.toHaveBeenCalled();
    expect(syncCart).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("tolerates a duplicate callback as a normal success", async () => {
    // Nexus marks a replayed callback with duplicate: true; it is still PAID.
    verifyNexusPayment.mockResolvedValue({ ...VERIFICATION, duplicate: true });
    const onSuccess = vi.fn();

    await completeVerifiedPayment({
      proof: PROOF,
      clearCart: vi.fn().mockResolvedValue(undefined),
      syncCart: vi.fn().mockResolvedValue(undefined),
      onSuccess,
    });

    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ duplicate: true }));
  });
});

describe("isRetryableVerificationFailure", () => {
  it("treats provider/network blips as pending rather than failed", () => {
    for (const code of [
      "PAYMENT_PROVIDER_UNAVAILABLE",
      "ORDER_UNAVAILABLE",
      "RATE_LIMIT_UNAVAILABLE",
      "NETWORK_UNAVAILABLE",
    ]) {
      expect(isRetryableVerificationFailure({ code })).toBe(true);
    }
  });

  it("treats definitive rejections as real failures", () => {
    for (const code of ["SIGNATURE_INVALID", "PAYMENT_UNVERIFIED", "AMOUNT_MISMATCH"]) {
      expect(isRetryableVerificationFailure({ code })).toBe(false);
    }
  });
});

describe("createSubmissionGuard", () => {
  it("blocks a second submission while one is in flight", () => {
    const guard = createSubmissionGuard();

    expect(guard.begin()).toBe(true);
    expect(guard.begin()).toBe(false);
    expect(guard.begin()).toBe(false);
  });

  it("allows a retry after the latch is released", () => {
    const guard = createSubmissionGuard();

    guard.begin();
    guard.release();

    expect(guard.begin()).toBe(true);
  });
});
