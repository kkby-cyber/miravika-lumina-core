import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => {
    const allQAs = SECTIONS.flatMap((s) => s.items);
    return {
      meta: [
        { title: "FAQs — Shipping, Returns & Payments | MIRAVIKA" },
        { name: "description", content: "Answers to common questions about MIRAVIKA orders, shipping, returns, payments and product care." },
        { property: "og:title", content: "MIRAVIKA — Customer Care FAQs" },
        { property: "og:description", content: "Everything you need to know about shopping with MIRAVIKA." },
        { property: "og:url", content: "https://miravika-lumina-core.lovable.app/faq" },
      ],
      links: [{ rel: "canonical", href: "https://miravika-lumina-core.lovable.app/faq" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: allQAs.map(([q, a]) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://miravika-lumina-core.lovable.app/" },
              { "@type": "ListItem", position: 2, name: "FAQs", item: "https://miravika-lumina-core.lovable.app/faq" },
            ],
          }),
        },
      ],
    };
  },
  component: FAQ,
});

const SECTIONS: { heading: string; items: [string, string][] }[] = [
  {
    heading: "Orders",
    items: [
      ["How do I place an order?", "Add items to your bag, proceed to secure checkout, enter your shipping details and choose your preferred payment method. You'll receive an order confirmation by email and, in India, by WhatsApp."],
      ["Can I modify or cancel my order?", "Reach us within 2 hours of placing your order at support@miravika.com. Once dispatched, orders cannot be modified but can be returned per our return policy."],
      ["How do I know my order was successful?", "You'll receive an order confirmation email within minutes. If you don't, please check your spam folder or write to us with your registered email."],
      ["Do you offer gift wrapping?", "Yes — most items ship in our signature MIRAVIKA packaging. Add a gift note at checkout and we'll take care of the rest."],
    ],
  },
  {
    heading: "Shipping & Delivery",
    items: [
      ["Where do you ship?", "We ship worldwide, including India, USA, UK, Canada, Australia, UAE and Europe. Customs duties, if any, are borne by the customer for international orders."],
      ["How long does delivery take?", "Within India: 3–7 business days. International: 7–14 business days depending on destination and customs clearance. Exact estimates appear at checkout and on each product page."],
      ["How do I track my order?", "You'll receive a tracking link by email (and WhatsApp in India) as soon as your order ships. You can also track from the Track Order page."],
      ["Are shipping charges refundable?", "Shipping charges are non-refundable unless the return is due to a defect or an error on our part."],
    ],
  },
  {
    heading: "Payments",
    items: [
      ["What payment methods are accepted?", "UPI, all major credit and debit cards, net banking and popular wallets. All orders are prepaid through our secure Shopify checkout."],
      ["Is checkout secure?", "Yes. Payments are processed by PCI-DSS compliant gateways over encrypted (SSL) connections. We never store your full card details on our servers."],
      ["In what currency are prices displayed?", "By default, prices are shown in your local currency where supported. You'll be charged the equivalent amount in your card's currency."],
    ],
  },
  {
    heading: "Returns & Refunds",
    items: [
      ["What is your return policy?", "We offer easy 7-day returns on unused items in their original packaging. Some categories (e.g. beauty, innerwear, personalised items) are non-returnable for hygiene and safety reasons."],
      ["How do I initiate a return?", "Write to support@miravika.com with your order number and reason. Our team will confirm eligibility and schedule a reverse pickup where available."],
      ["When will I receive my refund?", "Refunds are processed within 5–7 business days of the return being received and inspected. Bank credit timelines vary by method."],
      ["Can I exchange an item?", "Yes — exchanges for size or colour are supported on eligible items, subject to stock availability."],
    ],
  },
  {
    heading: "Products & Care",
    items: [
      ["Are the products authentic?", "Every product on MIRAVIKA is sourced from vetted brands and design studios. We stand behind everything we sell."],
      ["How do I care for jewelry?", "Keep away from moisture, perfume and lotion. Store in the pouch provided and wipe with a soft dry cloth after each wear."],
      ["Do you restock sold-out items?", "Bestsellers are frequently restocked. Sign up for restock alerts on the product page and we'll notify you the moment it's back."],
    ],
  },
  {
    heading: "Account & Support",
    items: [
      ["Do I need an account to shop?", "No — guest checkout is available. Creating an account lets you track orders, save addresses and manage your wishlist."],
      ["How do I contact customer care?", "Email support@miravika.com, message us on Instagram @miravika.india, or reach us via the Contact page. We reply within 24 hours, Monday to Saturday."],
      ["Do you have a physical store?", "MIRAVIKA is online-first and ships worldwide from our fulfilment partners."],
    ],
  },
];

function FAQ() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.32em] text-gold">Customer care</p>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">Frequently asked</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Everything you need to know about shopping with MIRAVIKA. Can't find your answer? Write to us at{" "}
        <a href="mailto:support@miravika.com" className="text-foreground underline underline-offset-4">support@miravika.com</a>.
      </p>
      <div className="mt-10 space-y-10">
        {SECTIONS.map((section) => (
          <div key={section.heading}>
            <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.28em] text-gold">{section.heading}</h2>
            <Accordion type="single" collapsible>
              {section.items.map(([q, a]) => (
                <AccordionItem key={q} value={q}>
                  <AccordionTrigger className="text-left">{q}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
