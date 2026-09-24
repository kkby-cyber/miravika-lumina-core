import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  Heart,
  LogOut,
  MapPin,
  Package,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getCustomerSession, signOutCustomer } from "@/lib/customer-auth";
import {
  getNexusCustomerAddresses,
  getNexusCustomerOrders,
  getNexusCustomerProfile,
  updateNexusCustomerProfile,
  type NexusAddress,
  type NexusCustomerOrder,
  type NexusCustomerProfile,
} from "@/lib/nexus";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your Account — MIRAVIKA" },
      {
        name: "description",
        content: "Manage your MIRAVIKA profile, orders, addresses and wishlist.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Account,
});

function Account() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<NexusCustomerProfile | null>(null);
  const [orders, setOrders] = useState<NexusCustomerOrder[]>([]);
  const [addresses, setAddresses] = useState<NexusAddress[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const session = await getCustomerSession();

        if (!session.session) {
          await navigate({ to: "/auth" });
          return;
        }

        const [profileResponse, ordersResponse, addressesResponse] = await Promise.all([
          getNexusCustomerProfile(),
          getNexusCustomerOrders(),
          getNexusCustomerAddresses(),
        ]);

        if (!active) return;

        const nextProfile = profileResponse.profile;

        setProfile(nextProfile);
        setFullName(nextProfile?.full_name ?? "");
        setPhone(nextProfile?.phone ?? "");
        setMarketingOptIn(nextProfile?.marketing_opt_in ?? false);
        setOrders(ordersResponse.orders);
        setAddresses(addressesResponse.addresses);
      } catch {
        if (!active) return;
        toast.error("We couldn't load your account.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAccount();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function saveProfile() {
    setSaving(true);

    try {
      const response = await updateNexusCustomerProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        marketing_opt_in: marketingOptIn,
      });

      setProfile(response.profile);
      setEditingProfile(false);
      toast.success("Your profile has been updated.");
    } catch {
      toast.error("We couldn't update your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    const result = await signOutCustomer();

    if (result.error) {
      toast.error("We couldn't sign you out.");
      return;
    }

    await navigate({ to: "/auth" });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="h-8 w-48 animate-pulse rounded bg-beige" />
        <div className="mt-3 h-4 w-72 animate-pulse rounded bg-beige/70" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl border border-border/60 bg-beige/30"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-16">
        <div className="flex flex-col gap-5 border-b border-border/60 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-gold">MIRAVIKA</p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">Your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-fit rounded-full"
            onClick={() => void handleSignOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <AccountSummary
            icon={<Package className="h-5 w-5" />}
            label="Orders"
            value={String(orders.length)}
            href="#orders"
          />
          <AccountSummary
            icon={<MapPin className="h-5 w-5" />}
            label="Addresses"
            value={String(addresses.length)}
            href="#addresses"
          />
          <AccountSummary
            icon={<Heart className="h-5 w-5" />}
            label="Wishlist"
            value="View"
            href="/wishlist"
          />
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <section id="profile" className="rounded-2xl border border-border/60 bg-white p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-gold">
                  Personal details
                </p>
                <h2 className="mt-2 font-display text-2xl">Profile</h2>
              </div>

              {!editingProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setEditingProfile(true)}
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
            </div>

            {editingProfile ? (
              <div className="mt-6 space-y-5">
                <div>
                  <Label htmlFor="account-name">Full name</Label>
                  <Input
                    id="account-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="mt-2 h-11 rounded-xl"
                    maxLength={120}
                  />
                </div>

                <div>
                  <Label htmlFor="account-phone">Phone</Label>
                  <Input
                    id="account-phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="mt-2 h-11 rounded-xl"
                    maxLength={30}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                  <div>
                    <p className="text-sm font-medium">MIRAVIKA updates</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Receive occasional product and store updates.
                    </p>
                  </div>
                  <Switch checked={marketingOptIn} onCheckedChange={setMarketingOptIn} />
                </div>

                <div className="flex gap-2">
                  <Button
                    className="rounded-full bg-foreground text-ivory hover:bg-foreground/90"
                    disabled={saving}
                    onClick={() => void saveProfile()}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save changes"}
                  </Button>

                  <Button
                    variant="ghost"
                    className="rounded-full"
                    disabled={saving}
                    onClick={() => setEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 divide-y divide-border/60">
                <ProfileRow label="Name" value={profile?.full_name || "Not added"} />
                <ProfileRow label="Email" value={profile?.email || "Not available"} />
                <ProfileRow label="Phone" value={profile?.phone || "Not added"} />
                <ProfileRow
                  label="Updates"
                  value={profile?.marketing_opt_in ? "Subscribed" : "Not subscribed"}
                />
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border/60 bg-beige/30 p-6 md:p-8">
            <ShieldCheck className="h-6 w-6 text-gold" />
            <h2 className="mt-4 font-display text-2xl">Account security</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your customer session is secured through MIRAVIKA&apos;s authenticated commerce
              backend.
            </p>
            <Link
              to="/auth"
              className="mt-5 inline-flex items-center text-xs uppercase tracking-[0.18em] underline-offset-4 hover:underline"
            >
              Manage sign-in
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </section>
        </div>

        <section id="orders" className="mt-12">
          <SectionHeading
            eyebrow="Purchase history"
            title="My orders"
            action={
              <Link
                to="/track-order"
                className="text-xs uppercase tracking-[0.16em] underline-offset-4 hover:underline"
              >
                Track an order
              </Link>
            }
          />

          {orders.length === 0 ? (
            <EmptyPanel
              icon={<Package className="h-6 w-6" />}
              title="No orders yet"
              description="Your completed MIRAVIKA orders will appear here."
            />
          ) : (
            <div className="mt-5 space-y-3">
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>

        <section id="addresses" className="mt-12">
          <SectionHeading eyebrow="Delivery details" title="Saved addresses" />

          {addresses.length === 0 ? (
            <EmptyPanel
              icon={<MapPin className="h-6 w-6" />}
              title="No saved addresses"
              description="Saved addresses will be available here for faster checkout."
            />
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {addresses.map((address) => (
                <AddressCard key={address.id} address={address} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-12 border-t border-border/60 pt-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Saved pieces</p>
              <h2 className="mt-2 font-display text-2xl">Wishlist</h2>
            </div>

            <Link to="/wishlist">
              <Button variant="outline" className="rounded-full">
                View wishlist
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function AccountSummary({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  const content = (
    <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-white p-5 transition-colors hover:bg-beige/20">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-beige/60 text-gold">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-xl">{value}</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );

  if (href.startsWith("/")) {
    return <Link to={href}>{content}</Link>;
  }

  return <a href={href}>{content}</a>;
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-gold">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function EmptyPanel({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-border/70 bg-beige/20 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-gold">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-xl">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function OrderRow({ order }: { order: NexusCustomerOrder }) {
  const total =
    typeof order.grand_total === "number" ? order.grand_total : Number(order.grand_total);

  return (
    <div className="rounded-2xl border border-border/60 bg-white p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">#{order.order_number}</p>
            <span className="rounded-full bg-beige px-2.5 py-1 text-[10px] uppercase tracking-[0.1em]">
              {order.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>

        <div className="text-left md:text-right">
          <p className="font-display text-xl">{formatCurrency(total, order.currency)}</p>
          <p className="mt-1 text-xs capitalize text-muted-foreground">
            Payment: {order.payment_status}
          </p>
        </div>
      </div>

      {order.order_items?.length ? (
        <div className="mt-4 border-t border-border/50 pt-4">
          {order.order_items.slice(0, 3).map((item, index) => (
            <div
              key={`${item.sku ?? item.title}-${index}`}
              className="flex items-center justify-between gap-4 py-1.5 text-sm"
            >
              <span className="truncate">
                {item.title} × {item.quantity}
              </span>
              <span className="shrink-0 text-muted-foreground">
                {formatCurrency(Number(item.line_total), order.currency)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {order.tracking_url ? (
        <a
          href={order.tracking_url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex text-xs uppercase tracking-[0.16em] underline-offset-4 hover:underline"
        >
          Track shipment
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </a>
      ) : null}
    </div>
  );
}

function AddressCard({ address }: { address: NexusAddress }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{address.full_name}</p>
          <p className="mt-1 text-xs capitalize text-muted-foreground">
            {address.label || address.address_type}
          </p>
        </div>

        {address.is_default && (
          <span className="rounded-full bg-beige px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-gold">
            Default
          </span>
        )}
      </div>

      <div className="mt-4 text-sm leading-6 text-muted-foreground">
        <p>{address.line1}</p>
        {address.line2 && <p>{address.line2}</p>}
        {address.landmark && <p>{address.landmark}</p>}
        <p>
          {address.city}, {address.state} {address.postal_code}
        </p>
        <p>{address.country}</p>
        <p className="mt-2">{address.phone}</p>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}
