import { verifyNexusPayment, type NexusPaymentVerification } from "@/lib/nexus";

/**
 * Post-payment orchestration.
 *
 * The rule this encodes: **payment success is decided by Nexus alone.** Cart
 * cleanup is housekeeping performed *after* a verified payment, so a failure
 * there (including a `cart_cleanup_pending` response) must never be surfaced to
 * the customer as a payment failure — the money has already been captured.
 */
export interface CompletePaymentInput {
  proof: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
  /** Best-effort server-side cart cleanup. Must not be allowed to fail the order. */
  clearCart: () => Promise<void>;
  /** Re-reads the authoritative cart so local state matches the server. */
  syncCart: () => Promise<void>;
  onSuccess: (verification: NexusPaymentVerification) => void;
}

/** Returns true when the failure is a transient condition that a retry may clear. */
function isRetryableVerificationFailure(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return (
    code === "PAYMENT_PROVIDER_UNAVAILABLE" ||
    code === "ORDER_UNAVAILABLE" ||
    code === "RATE_LIMIT_UNAVAILABLE" ||
    code === "NETWORK_UNAVAILABLE"
  );
}

/**
 * Verifies the payment with Nexus, then performs best-effort cart cleanup.
 *
 * Throws only when verification itself fails, so the caller can show a truthful
 * (non-success) state. A verified payment always reaches `onSuccess`, even when
 * cleanup fails.
 */
export async function completeVerifiedPayment(input: CompletePaymentInput): Promise<void> {
  const verification = await verifyNexusPayment(input.proof);

  // Payment is confirmed from here on. Cleanup problems are logged, not shown.
  try {
    await input.clearCart();
  } catch (cleanupError) {
    console.error("Payment verified but Nexus cart cleanup failed:", cleanupError);
  }

  // Re-read the authoritative cart rather than assuming it is empty.
  try {
    await input.syncCart();
  } catch (syncError) {
    console.error("Post-payment cart refresh failed:", syncError);
  }

  input.onSuccess(verification);
}

/**
 * A one-shot latch guarding checkout submission.
 *
 * `useState`-based `loading` is applied asynchronously, so two rapid clicks can
 * both observe `false` and create two Nexus orders. This ref-backed latch closes
 * that window and is only released when the customer can safely retry
 * (validation failure or a dismissed payment modal).
 */
export interface SubmissionGuard {
  /** Returns false when a submission is already in flight. */
  begin: () => boolean;
  /** Releases the latch so the customer may retry. */
  release: () => void;
}

export function createSubmissionGuard(): SubmissionGuard {
  let inFlight = false;
  return {
    begin: () => {
      if (inFlight) return false;
      inFlight = true;
      return true;
    },
    release: () => {
      inFlight = false;
    },
  };
}

export { isRetryableVerificationFailure };
