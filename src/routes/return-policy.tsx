import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/return-policy")({
  head: () => ({
    meta: [
      { title: "Returns & Refunds — MIRAVIKA" },
      { name: "description", content: "Easy 7-day returns and exchanges on eligible MIRAVIKA orders. Read the full return and refund policy." },
    ],
    links: [{ rel: "canonical", href: "https://miravika-lumina-core.lovable.app/return-policy" }],
  }),
  component: () => (
    <PolicyPage title="Returns & Exchanges">
      <h2>7-day easy returns</h2>
      <p>
        We want you to love what you receive. If something isn't quite right, you can request a return or exchange within 7 days of delivery, provided the item is unused, unwashed and in its original packaging with all tags intact.
      </p>
      <h2>How to request a return</h2>
      <p>
        Email <a href="mailto:support@miravika.com">support@miravika.com</a> with your order number and reason for return. Our team will confirm eligibility, share return instructions and — where serviceable — schedule a reverse pickup at no extra cost.
      </p>
      <h2>Refunds</h2>
      <p>
        Once we receive and inspect your return, refunds are processed within 5–7 business days to the original payment method or as MIRAVIKA store credit. Bank credit timelines vary by provider.
      </p>
      <h2>Exchanges</h2>
      <p>
        Size or colour exchanges are supported on eligible items, subject to stock availability. If your preferred variant is unavailable, we'll issue a refund or store credit.
      </p>
      <h2>Non-returnable items</h2>
      <p>
        For hygiene and safety, the following categories are non-returnable: beauty and personal care once opened, innerwear and swimwear, pierced jewelry, personalised items, gift cards and final-sale items.
      </p>
      <h2>Damaged or incorrect items</h2>
      <p>
        If your order arrives damaged, defective or incorrect, please email us within 48 hours of delivery with photos of the item and packaging. We'll replace it or issue a full refund, including shipping.
      </p>
      <h2>International returns</h2>
      <p>
        For international orders, return shipping costs and any applicable duties are the customer's responsibility unless the return is due to a defect or an error on our part.
      </p>
    </PolicyPage>
  ),
});
