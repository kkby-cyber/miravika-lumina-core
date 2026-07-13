import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — MIRAVIKA" },
      { name: "description", content: "The terms and conditions governing your use of miravika.com and purchases from MIRAVIKA." },
    ],
    links: [{ rel: "canonical", href: "https://miravika-lumina-core.lovable.app/terms" }],
  }),
  component: () => (
    <PolicyPage title="Terms & Conditions">
      <p>
        These Terms & Conditions govern your access to and use of miravika.com (the "Site") and any purchase you make from MIRAVIKA. By using the Site, you agree to these terms.
      </p>
      <h2>Eligibility</h2>
      <p>
        You must be at least 18 years old, or accessing the Site with the involvement of a parent or guardian, to place an order.
      </p>
      <h2>Orders & acceptance</h2>
      <p>
        All orders are offers to purchase and are subject to acceptance and stock availability. We reserve the right to refuse or cancel any order at our discretion, including in cases of suspected fraud, pricing errors or supply issues. Any amount charged for a cancelled order will be refunded in full.
      </p>
      <h2>Pricing & taxes</h2>
      <p>
        Prices are shown in your local currency where supported and are inclusive of applicable taxes for the displayed region. International duties and taxes, where applicable, are the customer's responsibility.
      </p>
      <h2>Product information</h2>
      <p>
        We take care to display products accurately, but slight variations in colour and finish may occur due to screen calibration and photography. Weights, dimensions and materials are approximate.
      </p>
      <h2>Intellectual property</h2>
      <p>
        All content on the Site — including images, product photography, copy, logos, videos and design — is the property of MIRAVIKA or its licensors and may not be used without prior written permission.
      </p>
      <h2>User conduct</h2>
      <p>
        You agree not to misuse the Site, attempt unauthorised access, upload harmful code, or use the Site to violate any law.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, MIRAVIKA's total liability arising out of any order is limited to the value of that order.
      </p>
      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the competent courts.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms? Email <a href="mailto:hello@miravika.com">hello@miravika.com</a>.
      </p>
    </PolicyPage>
  ),
});
