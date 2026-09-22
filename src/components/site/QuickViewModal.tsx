import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format-price";
import type { FrontendProduct } from "@/lib/nexus-product";
import { useCartStore } from "@/stores/cartStore";

export function QuickViewModal({
  product,
  open,
  onOpenChange,
}: {
  product: FrontendProduct;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const p = product;
  const variants = p.variants.edges.map((v) => v.node);
  const firstAvailable = variants.find((v) => v.availableForSale) ?? variants[0];
  const [selectedId, setSelectedId] = useState(firstAvailable?.id);
  const [busy, setBusy] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);

  const selected = variants.find((v) => v.id === selectedId) ?? firstAvailable;
  const img = p.images.edges[0]?.node;

  const add = async () => {
    if (!selected) return;
    setBusy(true);
    await addItem({
      product,
      variantId: selected.id,
      variantTitle: selected.title,
      price: selected.price,
      quantity: 1,
      selectedOptions: selected.selectedOptions ?? [],
    });
    setBusy(false);
    toast.success("Added to Cart", {
      description: p.title,
      position: "top-center",
    });
    onOpenChange(false);
    setCartOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 rounded-xl border-border/60 bg-ivory p-0 sm:max-w-lg">
        <div className="grid gap-0 sm:grid-cols-[minmax(0,150px)_1fr]">
          {img && (
            <div className="hidden aspect-[4/5] overflow-hidden rounded-l-xl bg-beige sm:block">
              <img src={img.url} alt={img.altText ?? p.title} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="p-5">
            <DialogHeader className="space-y-1 text-left">
              <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Select Options</p>
              <DialogTitle className="font-display text-xl leading-snug">{p.title}</DialogTitle>
              <DialogDescription className="text-sm text-foreground/80">
                {selected
                  ? formatPrice(parseFloat(selected.price.amount), selected.price.currencyCode)
                  : formatPrice(
                      parseFloat(p.priceRange.minVariantPrice.amount),
                      p.priceRange.minVariantPrice.currencyCode,
                    )}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 flex flex-wrap gap-2">
              {variants.map((v) => {
                const active = v.id === selectedId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={!v.availableForSale}
                    onClick={() => setSelectedId(v.id)}
                    className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${
                      active
                        ? "border-gold bg-beige text-foreground"
                        : "border-border text-foreground/70 hover:border-gold"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {active && <Check className="h-3 w-3 text-gold" />}
                      {v.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={add}
              disabled={busy || !selected?.availableForSale}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-[11px] uppercase tracking-[0.2em] text-ivory transition-all duration-300 hover:bg-foreground/90 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {selected?.availableForSale ? (busy ? "Adding" : "Add to Cart") : "Sold Out"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
