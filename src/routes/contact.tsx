import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — MIRAVIKA" }] }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(80),
  email: z.string().trim().email("Invalid email").max(160),
  message: z.string().trim().min(5, "Tell us a little more").max(1000),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      toast.error(r.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    // Encode to WhatsApp for instant routing
    const msg = `Name: ${r.data.name}%0AEmail: ${r.data.email}%0A%0A${encodeURIComponent(r.data.message)}`;
    window.open(`https://wa.me/?text=${msg}`, "_blank");
    setSubmitting(false);
    toast.success("Opening WhatsApp…");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.24em] text-gold">We'd love to hear from you</p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl">Contact us</h1>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div className="space-y-5 text-sm">
          <div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 text-gold" /><div><p className="font-medium">Email</p><p className="text-muted-foreground">hello@miravika.in</p></div></div>
          <div className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 text-gold" /><div><p className="font-medium">Call</p><p className="text-muted-foreground">+91 90000 00000 · Mon–Sat 10am–6pm IST</p></div></div>
          <div className="flex items-start gap-3"><MessageCircle className="mt-0.5 h-4 w-4 text-gold" /><div><p className="font-medium">WhatsApp</p><p className="text-muted-foreground">Fastest replies on WhatsApp</p></div></div>
          <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-gold" /><div><p className="font-medium">Atelier</p><p className="text-muted-foreground">Jaipur, Rajasthan · India</p></div></div>
        </div>
        <form onSubmit={onSubmit} className="space-y-3 rounded-md border border-border/60 bg-card p-6">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm" />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm" />
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" rows={5} className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm" />
          <Button type="submit" disabled={submitting} className="w-full rounded-full bg-foreground text-ivory hover:bg-foreground/90">Send</Button>
        </form>
      </div>
    </div>
  );
}
