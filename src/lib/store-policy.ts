/**
 * Customer-facing store facts, kept in one place so marketing copy never drifts from what
 * checkout actually does. These mirror the Nexus shipping configuration (India zone,
 * "Standard Delivery": ₹79 flat, free at ₹999+) and the published shipping/return policies.
 * Nexus stays authoritative for the charge itself — checkout always uses the server quote.
 */
export const FREE_SHIPPING_THRESHOLD_INR = 999;
export const FLAT_SHIPPING_INR = 79;
// Matches the live Nexus "Standard Delivery" method (min_days 4, max_days 7).
export const DELIVERY_WINDOW = "4–7 business days";
export const RETURN_WINDOW_DAYS = 7;
export const SHIPPING_REGION = "India";

export const STORE_PROMISES = {
  shipping: `Complimentary shipping across ${SHIPPING_REGION} on orders above ₹${FREE_SHIPPING_THRESHOLD_INR}`,
  returns: `Easy ${RETURN_WINDOW_DAYS}-day returns on eligible orders`,
  payments: "Secure checkout by Razorpay · UPI, cards & net banking",
  delivery: `Delivered across ${SHIPPING_REGION} in ${DELIVERY_WINDOW}`,
} as const;
