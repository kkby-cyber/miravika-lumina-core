import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({ meta: [{ title: "Shipping Policy — MIRAVIKA" }] }),
  component: () => (
    <PolicyPage title="Shipping Policy">
      <h2>Processing</h2>
      <p>Orders are processed within 24–48 business hours (Mon–Sat). You'll receive a tracking link via email and WhatsApp as soon as your order ships.</p>
      <h2>Delivery times</h2>
      <p>Metro cities: 3–5 business days. Rest of India: 5–7 business days. Remote pincodes may take slightly longer.</p>
      <h2>Charges</h2>
      <p>Free shipping on prepaid orders above ₹999. Orders below ₹999 attract a flat shipping fee of ₹79. COD orders attract a small handling fee at checkout.</p>
      <h2>COD</h2>
      <p>Cash on Delivery is available across India on most pincodes.</p>
      <h2>Lost / delayed shipments</h2>
      <p>If your order hasn't arrived within 10 business days, please write to hello@miravika.in and we'll resolve it immediately.</p>
    </PolicyPage>
  ),
});
