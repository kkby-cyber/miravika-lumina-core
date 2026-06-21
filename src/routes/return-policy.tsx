import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/return-policy")({
  head: () => ({ meta: [{ title: "Return Policy — MIRAVIKA" }] }),
  component: () => (
    <PolicyPage title="Return & Exchange Policy">
      <h2>7-day easy returns</h2>
      <p>If something isn't right, you may return or exchange any unused item in its original packaging within 7 days of delivery.</p>
      <h2>How to return</h2>
      <p>Write to hello@miravika.in with your order number and reason. We'll schedule a reverse pickup at no extra cost on serviceable pincodes.</p>
      <h2>Refunds</h2>
      <p>Refunds are processed within 5–7 business days after we receive and inspect the return. Refunds are made to the original payment method or as store credit.</p>
      <h2>Non-returnable</h2>
      <p>Sale items, gift cards and used items cannot be returned.</p>
    </PolicyPage>
  ),
});
