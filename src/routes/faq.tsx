import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQs — MIRAVIKA" }] }),
  component: FAQ,
});

const items = [
  ["What payment methods do you accept?", "UPI, all major credit/debit cards, net banking and Cash on Delivery (COD) across India."],
  ["How long does shipping take?", "Orders are dispatched within 24–48 hours. Delivery typically takes 3–7 business days across India."],
  ["Do you ship internationally?", "Currently we ship within India only. International shipping is coming soon."],
  ["What is your return policy?", "We offer easy 7-day returns on unused items in original packaging. See our Return Policy for full details."],
  ["Are your products handmade?", "Yes — every MIRAVIKA piece is hand-finished by women artisans in Jaipur."],
  ["How do I care for my accessory?", "Spot clean with cold water. Store flat in the pouch provided, away from direct sunlight."],
];

function FAQ() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
      <h1 className="font-display text-4xl md:text-5xl">Frequently asked</h1>
      <div className="mt-10">
        <Accordion type="single" collapsible>
          {items.map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger className="text-left">{q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
