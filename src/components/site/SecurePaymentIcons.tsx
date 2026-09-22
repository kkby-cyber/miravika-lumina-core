import { CreditCard, Landmark, Lock, Smartphone, Wallet } from "lucide-react";

const METHODS = [
  { icon: Smartphone, label: "UPI" },
  { icon: CreditCard, label: "Cards" },
  { icon: Landmark, label: "Net Banking" },
  { icon: Wallet, label: "Wallets" },
];

/** Payment methods available on the MIRAVIKA checkout. */
export function SecurePaymentIcons({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-border/60 bg-beige/30 p-4 ${className}`}>
      <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        <Lock className="h-3 w-3 text-gold" /> Secure checkout
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {METHODS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-ivory px-2.5 py-1.5 text-[10px] uppercase tracking-[0.14em]"
          >
            <Icon className="h-3.5 w-3.5 text-gold" strokeWidth={1.6} />
            {label}
          </span>
        ))}
      </div>
      <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
        Payments are processed through our secure PCI-DSS compliant checkout. MIRAVIKA never stores
        your card details.
      </p>
    </div>
  );
}
