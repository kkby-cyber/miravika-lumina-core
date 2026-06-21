import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({ meta: [{ title: "Privacy Policy — MIRAVIKA" }] }),
  component: () => (
    <PolicyPage title="Privacy Policy">
      <p>This page explains what data MIRAVIKA collects and how we use it. We collect only what we need to fulfil your order and improve your experience.</p>
      <h2>What we collect</h2>
      <p>Name, contact details (email, phone), shipping/billing address, order history, device and browsing information.</p>
      <h2>How we use it</h2>
      <p>To process orders and payments, send shipping updates, provide customer support, and (with your consent) share occasional updates about new collections.</p>
      <h2>Payments</h2>
      <p>Payments are processed by our PCI-compliant payment partners (e.g. Razorpay, Shopify Payments). We never store full card details on our servers.</p>
      <h2>Your rights</h2>
      <p>You can request access, correction or deletion of your data at any time by writing to hello@miravika.in.</p>
    </PolicyPage>
  ),
});
