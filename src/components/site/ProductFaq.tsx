import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface Faq {
  q: string;
  a: string;
}

/**
 * Product-level FAQs. Merchandising can override per product by adding Shopify
 * tags in the form `faq:Question?::Answer` — otherwise the shared MIRAVIKA
 * shopping FAQs are shown.
 */
export function faqsForProduct(tags: string[] | undefined, hasSize: boolean): Faq[] {
  const fromTags: Faq[] = (tags ?? [])
    .filter((t) => t.toLowerCase().startsWith("faq:"))
    .map((t) => {
      const [q, a] = t.slice(4).split("::");
      return { q: (q ?? "").trim(), a: (a ?? "").trim() };
    })
    .filter((f) => f.q && f.a);

  if (fromTags.length) return fromTags;

  const base: Faq[] = [
    {
      q: "How long will delivery take?",
      a: "Orders are dispatched within 24–48 hours. Delivery is 3–7 business days across India and 7–14 business days internationally. You'll receive a tracking link by email as soon as your parcel ships.",
    },
    {
      q: "Which payment methods are accepted?",
      a: "UPI, credit and debit cards, net banking and popular wallets. Every payment is processed through our secure PCI-DSS compliant payment flow.",
    },
    {
      q: "Can I return or exchange this piece?",
      a: "Yes — 7-day easy returns on unused items in their original packaging. Start a return by emailing support@miravika.com with your order number and we'll arrange the pickup.",
    },
    {
      q: "Is this the authentic MIRAVIKA product?",
      a: "Every order ships directly from MIRAVIKA's own inventory in branded packaging. We do not sell through unauthorised resellers.",
    },
    {
      q: "How should I care for it?",
      a: "Store your piece in the box provided, away from moisture, direct sunlight and perfumes or chemicals. Wipe gently with a soft dry cloth to preserve the finish.",
    },
  ];

  if (hasSize) {
    base.splice(1, 0, {
      q: "How do I choose my size?",
      a: "Use the size guide on this page and measure against a garment you already own. If you are between sizes, we recommend sizing up. Write to support@miravika.com and our team will advise on fit.",
    });
  }

  return base;
}

export function ProductFaq({ faqs }: { faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <section className="mt-20 border-t border-border/50 pt-14">
      <div className="mb-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Good to Know</p>
        <h2 className="mt-2 font-display text-2xl md:text-3xl">Product FAQs</h2>
      </div>
      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible>
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
