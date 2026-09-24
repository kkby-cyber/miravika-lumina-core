import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — MIRAVIKA" },
      {
        name: "description",
        content:
          "MIRAVIKA shipping timelines, charges, payment options and international delivery.",
      },
    ],
    links: [{ rel: "canonical", href: "https://miravika.com/shipping-policy" }],
  }),
  component: () => (
    <PolicyPage title="Shipping Policy">
      <h2>Order processing</h2>
      <p>
        Orders are processed within 24–48 business hours (Monday to Saturday, excluding public
        holidays). You'll receive a shipping confirmation with tracking as soon as your order leaves
        our fulfilment centre.
      </p>
      <h2>India — delivery timelines</h2>
      <p>
        Metro cities: 3–5 business days. Rest of India: 5–7 business days. Remote pincodes may take
        slightly longer.
      </p>
      <h2>International — delivery timelines</h2>
      <p>
        USA, UK, Canada, Australia, UAE and Europe: 7–14 business days depending on destination and
        customs clearance. Exact estimates appear at checkout.
      </p>
      <h2>Shipping charges</h2>
      <p>
        Complimentary shipping within India on prepaid orders above ₹999. Orders below ₹999 attract
        a flat shipping fee of ₹79. International shipping is calculated at checkout based on
        destination and order weight.
      </p>
      <h2>Payment</h2>
      <p>
        All orders are processed through our secure checkout — UPI, credit and debit cards, net
        banking and wallets are supported.
      </p>
      <h2>Duties & taxes (international)</h2>
      <p>
        International orders may be subject to import duties, taxes and customs fees levied by the
        destination country. These charges are the customer's responsibility and are collected by
        the courier or customs authority at delivery.
      </p>
      <h2>Lost or delayed shipments</h2>
      <p>
        If your order hasn't arrived within the estimated timeline, please write to{" "}
        <a href="mailto:support@miravika.com">support@miravika.com</a> with your order number and
        we'll investigate immediately.
      </p>
    </PolicyPage>
  ),
});
