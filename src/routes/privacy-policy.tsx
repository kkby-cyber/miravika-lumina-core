import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — MIRAVIKA" },
      { name: "description", content: "How MIRAVIKA collects, uses and protects your personal information." },
    ],
    links: [{ rel: "canonical", href: "https://miravika-lumina-core.lovable.app/privacy-policy" }],
  }),
  component: () => (
    <PolicyPage title="Privacy Policy">
      <p>
        This Privacy Policy explains how MIRAVIKA ("we", "our", "us") collects, uses, discloses and safeguards your information when you visit miravika.com or make a purchase from us. By using our website, you agree to the practices described below.
      </p>
      <h2>Information we collect</h2>
      <p>
        We collect information you provide directly — such as name, email, phone number, shipping and billing addresses, and order history — as well as information collected automatically, such as device type, IP address, browser, pages viewed and referral source.
      </p>
      <h2>How we use your information</h2>
      <p>
        Your information is used to process and fulfil orders, provide customer support, prevent fraud, improve our website and — with your consent — send marketing communications about new arrivals, offers and editorial content.
      </p>
      <h2>Payments</h2>
      <p>
        Payments are processed by PCI-DSS compliant providers (including Shopify Payments, Razorpay, PayPal and card networks). We do not store full card numbers on our servers.
      </p>
      <h2>Sharing with third parties</h2>
      <p>
        We share information only with service providers who help us operate our business — payment processors, shipping partners, fulfilment providers, analytics and customer support tools. These providers are contractually required to protect your data.
      </p>
      <h2>Cookies</h2>
      <p>
        We use cookies and similar technologies to remember your preferences, keep you signed in, measure site performance and deliver relevant advertising. You can control cookies via your browser settings.
      </p>
      <h2>Data retention</h2>
      <p>
        We retain personal information only as long as necessary to provide our services and comply with legal, tax and accounting obligations.
      </p>
      <h2>Your rights</h2>
      <p>
        You can request access, correction, portability or deletion of your personal data, and withdraw marketing consent at any time, by writing to <a href="mailto:privacy@miravika.com">privacy@miravika.com</a>.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about this policy? Email <a href="mailto:privacy@miravika.com">privacy@miravika.com</a>.
      </p>
    </PolicyPage>
  ),
});
