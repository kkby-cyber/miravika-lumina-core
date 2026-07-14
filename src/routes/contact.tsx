import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Instagram, Mail, MessageCircle, Clock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact MIRAVIKA — Customer Care" },
      { name: "description", content: "Reach the MIRAVIKA customer care team by email, WhatsApp or Instagram. We reply within 24 hours, Monday to Saturday." },
    ],
    links: [{ rel: "canonical", href: "https://miravika-lumina-core.lovable.app/contact" }],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(80),
  email: z.string().trim().email("Please enter a valid email").max(160),
  subject: z.string().trim().max(120).optional(),
  message: z.string().trim().min(5, "Tell us a little more so we can help").max(1000),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      toast.error(r.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const text = `Name: ${r.data.name}%0AEmail: ${r.data.email}%0ASubject: ${r.data.subject ?? "General"}%0A%0A${encodeURIComponent(r.data.message)}`;
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setSubmitting(false);
    toast.success("Opening WhatsApp — we'll take it from here");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.32em] text-gold">Customer care</p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl">We'd love to hear from you</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Questions about an order, sizing, availability or a wholesale enquiry? Our team replies within 24 hours, Monday to Saturday.
      </p>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <div className="space-y-5 text-sm">
          <ContactRow icon={Mail} title="Email" value="support@miravika.com" href="mailto:support@miravika.com" />
          <ContactRow icon={MessageCircle} title="WhatsApp" value="Fastest replies — chat with us on WhatsApp" href="https://wa.me/" />
          <ContactRow icon={Instagram} title="Instagram" value="@miravika.india" href="https://instagram.com/miravika.india" />
          <ContactRow icon={Clock} title="Business hours" value="Mon–Sat · 10:00–18:00 IST" />
          <div className="flex items-start gap-3 rounded-md border border-border/60 bg-card p-4">
            <HelpCircle className="mt-0.5 h-4 w-4 text-gold" />
            <div>
              <p className="font-medium">Looking for a quick answer?</p>
              <p className="text-muted-foreground">
                Most questions are answered on our{" "}
                <Link to="/faq" className="text-foreground underline underline-offset-4">FAQ page</Link>.
              </p>
            </div>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-3 rounded-md border border-border/60 bg-card p-6">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm" />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm" />
          <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject (optional)" className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm" />
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" rows={5} className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm" />
          <Button type="submit" disabled={submitting} className="w-full rounded-full bg-foreground text-ivory hover:bg-foreground/90">
            {submitting ? "Sending…" : "Send message"}
          </Button>
          <p className="text-[11px] text-muted-foreground">By submitting, you agree to our privacy policy.</p>
        </form>
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, title, value, href }: { icon: any; title: string; value: string; href?: string }) {
  const content = (
    <>
      <Icon className="mt-0.5 h-4 w-4 text-gold" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground">{value}</p>
      </div>
    </>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="flex items-start gap-3 transition hover:text-foreground">
        {content}
      </a>
    );
  }
  return <div className="flex items-start gap-3">{content}</div>;
}
