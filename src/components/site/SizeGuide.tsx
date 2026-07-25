import { useState } from "react";
import { Ruler } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const APPAREL = [
  ["XS", "32", "26", "34"],
  ["S", "34", "28", "36"],
  ["M", "36", "30", "38"],
  ["L", "38", "32", "40"],
  ["XL", "40", "34", "42"],
  ["XXL", "42", "36", "44"],
];

/**
 * Shown only when a product actually has a Size option.
 * Measurements are body measurements in inches — the standard MIRAVIKA apparel grade.
 */
export function SizeGuide({ optionValues }: { optionValues: string[] }) {
  const [open, setOpen] = useState(false);
  const rows = APPAREL.filter((r) =>
    optionValues.some((v) => v.trim().toUpperCase() === r[0]),
  );
  const table = rows.length ? rows : APPAREL;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-gold">
          <Ruler className="h-3.5 w-3.5" /> Size Guide
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-ivory">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Size Guide</DialogTitle>
          <DialogDescription className="text-xs">
            Body measurements in inches. If you are between sizes, we recommend sizing up.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <th className="py-2 pr-3">Size</th>
                <th className="py-2 pr-3">Bust</th>
                <th className="py-2 pr-3">Waist</th>
                <th className="py-2">Hip</th>
              </tr>
            </thead>
            <tbody>
              {table.map(([size, bust, waist, hip]) => (
                <tr key={size} className="border-b border-border/40 last:border-0">
                  <td className="py-2 pr-3 font-medium">{size}</td>
                  <td className="py-2 pr-3">{bust}"</td>
                  <td className="py-2 pr-3">{waist}"</td>
                  <td className="py-2">{hip}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Need help? Write to support@miravika.com and our team will advise on fit before you order.
        </p>
      </DialogContent>
    </Dialog>
  );
}
