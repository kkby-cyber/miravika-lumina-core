import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, LockKeyhole, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/format-price";
import { trackBeginCheckout } from "@/lib/analytics";
import { loadRazorpay } from "@/lib/razorpay";
import { getNexusShippingQuote } from "@/lib/nexus";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — MIRAVIKA" },
      {
        name: "description",
        content: "Secure checkout for your MIRAVIKA order.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CheckoutPage,
});

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
};

type CheckoutResponse = {
  success: boolean;
  data?: {
    order_id: string;
    order_number: string;
    totals: {
      subtotal: number;
      discount: number;
      tax: number;
      shipping: number;
      total: number;
      currency: string;
    };
    razorpay: {
      key_id: string;
      order_id: string;
      amount: number;
      currency: string;
    };
  };
  error?: {
    message?: string;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, cost, isLoading, clearCart, syncCart } = useCartStore();

  const [form, setForm] = useState<FormState>({
    full_name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
  });

  const [cod, setCod] = useState(false);
  const [shippingQuote, setShippingQuote] = useState<{
    serviceable: boolean;
    shipping_charge: number;
    currency: string;
    estimated_days?: number | null;
    etd?: string | null;
    cod_available?: boolean;
  } | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currency = "INR";

  const cartItems = useMemo(
    () =>
      items.map((item) => {
        const variant = item.product.variants.edges.find(({ node }) => node.id === item.variantId);

        return {
          sku: variant?.node.sku || item.product.sku,
          quantity: item.quantity,
        };
      }),
    [items],
  );

  useEffect(() => {
    if (!items.length) return;

    trackBeginCheckout(
      items.map((item, index) => ({
        item_id: item.product.sku,
        item_name: item.product.title,
        item_brand: item.product.brand || "MIRAVIKA",
        item_category: item.product.productType || undefined,
        price: Number(item.price.amount),
        quantity: item.quantity,
        index,
      })),
      currency,
    );
  }, [items, currency]);

  useEffect(() => {
    void syncCart();
  }, [syncCart]);

  const setField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const checkDelivery = async () => {
    const pincode = form.postal_code.trim();

    if (!/^\d{6}$/.test(pincode)) {
      setShippingQuote(null);
      setShippingError("Please enter a valid 6-digit PIN code.");
      return;
    }

    if (!cartItems.length) {
      setShippingQuote(null);
      setShippingError("Your bag is empty.");
      return;
    }

    setShippingLoading(true);
    setShippingError("");

    try {
      const quote = await getNexusShippingQuote({
        pincode,
        items: cartItems,
        cod: false,
      });

      setShippingQuote(quote);

      if (!quote.serviceable) {
        setShippingError("Delivery is currently unavailable for this PIN code.");
      }
    } catch (quoteError) {
      setShippingQuote(null);
      setShippingError(
        quoteError instanceof Error
          ? quoteError.message
          : "We could not check delivery availability.",
      );
    } finally {
      setShippingLoading(false);
    }
  };

  const submitCheckout = async () => {
    setError("");

    if (!items.length) {
      setError("Your bag is empty.");
      return;
    }

    const required: Array<keyof FormState> = [
      "full_name",
      "email",
      "phone",
      "line1",
      "city",
      "state",
      "postal_code",
    ];

    if (required.some((field) => !form[field].trim())) {
      setError("Please complete all required delivery details.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(form.postal_code.trim())) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/public/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          phone: form.phone.replace(/\D/g, ""),
          full_name: form.full_name.trim(),
          items: cartItems,
          shipping_address: {
            full_name: form.full_name.trim(),
            phone: form.phone.replace(/\D/g, ""),
            line1: form.line1.trim(),
            ...(form.line2.trim() ? { line2: form.line2.trim() } : {}),
            city: form.city.trim(),
            state: form.state.trim(),
            postal_code: form.postal_code.trim(),
            country: "IN",
          },
          billing_same_as_shipping: true,
        }),
      });

      const result = (await response.json()) as CheckoutResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error?.message || "We could not create your order.");
      }

      const checkout = result.data;

      await loadRazorpay();

      if (!window.Razorpay) {
        throw new Error("Secure payment is temporarily unavailable.");
      }

      const Razorpay = window.Razorpay;

      const razorpay = new Razorpay({
        key: checkout.razorpay.key_id,
        amount: checkout.razorpay.amount,
        currency: checkout.razorpay.currency,
        name: "MIRAVIKA",
        description: `MIRAVIKA Order ${checkout.order_number}`,
        order_id: checkout.razorpay.order_id,
        prefill: {
          name: form.full_name,
          email: form.email,
          contact: form.phone.replace(/\D/g, ""),
        },
        notes: {
          order_number: checkout.order_number,
        },
        theme: {
          color: "#C9A86A",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (payment: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyResponse = await fetch("/api/public/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payment),
            });

            const verification = (await verifyResponse.json()) as {
              success: boolean;
              data?: {
                order_number: string;
                status: string;
              };
              error?: {
                message?: string;
              };
            };

            if (!verifyResponse.ok || !verification.success || !verification.data) {
              throw new Error(
                verification.error?.message ||
                  "Payment was received but the order could not be confirmed.",
              );
            }

            try {
              await clearCart();
            } catch (clearError) {
              console.error("Payment verified but Nexus cart cleanup failed:", clearError);
              throw new Error(
                "Payment was confirmed, but your shopping bag could not be cleared. " +
                  "Please refresh the page or contact MIRAVIKA support if the bag still shows items.",
              );
            }

            const params = new URLSearchParams({
              order_id: verification.data.order_number,
              value: String(checkout.totals.total),
              currency: checkout.totals.currency,
              shipping: String(checkout.totals.shipping),
              tax: String(checkout.totals.tax),
            });

            navigate({
              to: "/thank-you",
              search: Object.fromEntries(params.entries()),
            });
          } catch (verificationError) {
            setLoading(false);
            setError(
              verificationError instanceof Error
                ? verificationError.message
                : "Payment verification failed. Please contact MIRAVIKA support.",
            );
          }
        },
      });

      razorpay.open();
    } catch (checkoutError) {
      setLoading(false);
      setError(
        checkoutError instanceof Error ? checkoutError.message : "Checkout could not be completed.",
      );
    }
  };

  if (isLoading && !items.length) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-3xl">Your bag is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Add something beautiful from MIRAVIKA before checking out.
        </p>
        <Button asChild className="mt-6">
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="bg-[#F8F5F1] min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#8b7654]">MIRAVIKA</p>
            <h1 className="mt-2 font-serif text-3xl md:text-4xl">Secure Checkout</h1>
          </div>

          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to bag
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section className="rounded-2xl bg-white p-5 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-[#8b7654]" />
              <span className="text-sm">Your payment is securely processed by Razorpay.</span>
            </div>

            <h2 className="font-serif text-2xl">Delivery Details</h2>

            <div className="mt-6 grid gap-5">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setField("full_name", e.target.value)}
                  className="mt-2"
                  autoComplete="name"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className="mt-2"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Mobile Number *</Label>
                  <Input
                    id="phone"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    className="mt-2"
                    autoComplete="tel"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="line1">Address *</Label>
                <Input
                  id="line1"
                  value={form.line1}
                  onChange={(e) => setField("line1", e.target.value)}
                  className="mt-2"
                  autoComplete="address-line1"
                />
              </div>

              <div>
                <Label htmlFor="line2">Apartment, Landmark, etc.</Label>
                <Textarea
                  id="line2"
                  value={form.line2}
                  onChange={(e) => setField("line2", e.target.value)}
                  className="mt-2"
                  rows={2}
                  autoComplete="address-line2"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    className="mt-2"
                    autoComplete="address-level2"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => setField("state", e.target.value)}
                    className="mt-2"
                    autoComplete="address-level1"
                  />
                </div>

                <div>
                  <Label htmlFor="postal_code">PIN Code *</Label>

                  <div className="mt-2 flex gap-2">
                    <Input
                      id="postal_code"
                      inputMode="numeric"
                      value={form.postal_code}
                      onChange={(e) => {
                        setField("postal_code", e.target.value.replace(/\D/g, "").slice(0, 6));
                        setShippingQuote(null);
                        setShippingError("");
                      }}
                      className="flex-1"
                      autoComplete="postal-code"
                      maxLength={6}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={checkDelivery}
                      disabled={shippingLoading}
                      className="shrink-0"
                    >
                      {shippingLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking
                        </>
                      ) : (
                        "Check Delivery"
                      )}
                    </Button>
                  </div>

                  {shippingQuote?.serviceable && (
                    <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm">
                      <p className="font-medium text-green-800">Delivery available</p>

                      <div className="mt-1 space-y-1 text-green-700">
                        <p>
                          Shipping:{" "}
                          {formatPrice(shippingQuote.shipping_charge, shippingQuote.currency)}
                        </p>

                        {shippingQuote.estimated_days && (
                          <p>
                            Estimated delivery: {shippingQuote.estimated_days}{" "}
                            {shippingQuote.estimated_days === 1 ? "day" : "days"}
                          </p>
                        )}

                        {shippingQuote.etd && <p>Expected by: {shippingQuote.etd}</p>}

                        {shippingQuote.cod_available !== undefined && (
                          <p>COD: {shippingQuote.cod_available ? "Available" : "Not available"}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {shippingError && (
                    <p className="mt-2 text-sm text-destructive">{shippingError}</p>
                  )}
                </div>
              </div>
            </div>

            {error ? (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <Button
              type="button"
              onClick={() => void submitCheckout()}
              disabled={loading}
              className="mt-8 h-12 w-full bg-[#2B2B2B] text-white hover:bg-[#2B2B2B]/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Securely…
                </>
              ) : (
                `Pay ${formatPrice(cost?.totalAmount?.amount ?? "0", currency)}`
              )}
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Secure Checkout · Cash on Delivery in India
            </p>
          </section>

          <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm md:p-7 lg:sticky lg:top-6">
            <h2 className="font-serif text-2xl">Your Order</h2>

            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.variantId}`} className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#EFE7DD]">
                    {item.product.images.edges[0]?.node.url ? (
                      <img
                        src={item.product.images.edges[0].node.url}
                        alt={item.product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">{item.product.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>

                  <p className="text-sm font-medium">
                    {formatPrice(Number(item.price.amount) * item.quantity, currency)}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cost?.subtotalAmount?.amount ?? "0", currency)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shippingQuote?.serviceable
                    ? formatPrice(shippingQuote.shipping_charge, shippingQuote.currency)
                    : "Calculated at checkout"}
                </span>
              </div>

              {shippingQuote?.serviceable && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Delivery estimate</span>
                  <span>
                    {shippingQuote.estimated_days
                      ? `${shippingQuote.estimated_days} ${
                          shippingQuote.estimated_days === 1 ? "day" : "days"
                        }`
                      : "Shown after address verification"}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-base font-semibold">
                <span>Estimated Total</span>
                <span>{formatPrice(cost?.totalAmount?.amount ?? "0", currency)}</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-[#F8F5F1] p-4 text-xs leading-5 text-muted-foreground">
              Final shipping, tax and applicable discounts are calculated securely by MIRAVIKA
              before payment.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
