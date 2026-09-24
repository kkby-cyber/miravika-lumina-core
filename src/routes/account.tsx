import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  Heart,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getCustomerSession, signOutCustomer } from "@/lib/customer-auth";
import { useWishlistStore } from "@/stores/wishlistStore";
import {
  createNexusCustomerAddress,
  deleteNexusCustomerAddress,
  getNexusCustomerAddresses,
  getNexusCustomerOrders,
  getNexusCustomerProfile,
  updateNexusCustomerAddress,
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

  const [addressEditorOpen, setAddressEditorOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<NexusAddress | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressDeletingId, setAddressDeletingId] = useState<string | null>(null);
  const [addressDefaultId, setAddressDefaultId] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    landmark: "",
    city: "",
    state: "",
    postal_code: "",
    country: "IN",
    address_type: "shipping" as "shipping" | "billing",
    is_default: false,
  });

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

  function openAddAddress() {
    setEditingAddress(null);
    setAddressError(null);
    setAddressForm({
      label: "",
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      line1: "",
      line2: "",
      landmark: "",
      city: "",
      state: "",
      postal_code: "",
      country: "IN",
      address_type: "shipping",
      is_default: addresses.length === 0,
    });
    setAddressEditorOpen(true);
  }

  function openEditAddress(address: NexusAddress) {
    setEditingAddress(address);
    setAddressError(null);
    setAddressForm({
      label: address.label ?? "",
      full_name: address.full_name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? "",
      landmark: address.landmark ?? "",
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country || "IN",
      address_type: address.address_type,
      is_default: address.is_default,
    });
    setAddressEditorOpen(true);
  }

  function closeAddressEditor() {
    if (addressSaving) return;
    setAddressEditorOpen(false);
    setEditingAddress(null);
    setAddressError(null);
  }

  function updateAddressField(field: keyof typeof addressForm, value: string | boolean) {
    setAddressForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveAddress() {
    const requiredFields = [
      ["full_name", "Full name"],
      ["phone", "Phone"],
      ["line1", "Address line 1"],
      ["city", "City"],
      ["state", "State"],
      ["postal_code", "Postal code"],
    ] as const;

    for (const [field, label] of requiredFields) {
      if (!String(addressForm[field]).trim()) {
        setAddressError(`${label} is required.`);
        return;
      }
    }

    setAddressSaving(true);
    setAddressError(null);

    const payload = {
      address_type: addressForm.address_type,
      label: addressForm.label.trim() || null,
      full_name: addressForm.full_name.trim(),
      phone: addressForm.phone.trim(),
      line1: addressForm.line1.trim(),
      line2: addressForm.line2.trim() || null,
      landmark: addressForm.landmark.trim() || null,
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      postal_code: addressForm.postal_code.trim(),
      country: addressForm.country.trim().toUpperCase() || "IN",
      is_default: addressForm.is_default,
    };

    try {
      if (editingAddress) {
        const response = await updateNexusCustomerAddress(editingAddress.id, payload);
        setAddresses((current) =>
          current.map((address) => (address.id === editingAddress.id ? response.address : address)),
        );
        toast.success("Your address has been updated.");
      } else {
        const response = await createNexusCustomerAddress(payload);
        setAddresses((current) => {
          const next = addressForm.is_default
            ? current.map((address) => ({ ...address, is_default: false }))
            : current;
          return [...next, response.address];
        });
        toast.success("Your address has been saved.");
      }

      setAddressEditorOpen(false);
      setEditingAddress(null);
    } catch {
      setAddressError("We couldn't save this address. Please try again.");
    } finally {
      setAddressSaving(false);
    }
  }

  async function deleteAddress(address: NexusAddress) {
    const confirmed = window.confirm(
      "Delete this address? This saved address will be permanently removed from your account.",
    );

    if (!confirmed) return;

    setAddressDeletingId(address.id);

    try {
      await deleteNexusCustomerAddress(address.id);
      setAddresses((current) => current.filter((item) => item.id !== address.id));
      toast.success("Address deleted.");
    } catch {
      toast.error("We couldn't delete this address.");
    } finally {
      setAddressDeletingId(null);
    }
  }

  async function setDefaultAddress(address: NexusAddress) {
    if (address.is_default) return;

    setAddressDefaultId(address.id);

    try {
      const response = await updateNexusCustomerAddress(address.id, {
        is_default: true,
      });

      setAddresses((current) =>
        current.map((item) =>
          item.id === address.id ? response.address : { ...item, is_default: false },
        ),
      );

      toast.success("Default address updated.");
    } catch {
      toast.error("We couldn't update your default address.");
    } finally {
      setAddressDefaultId(null);
    }
  }

  async function handleSignOut() {
    const result = await signOutCustomer();

    if (result.error) {
      toast.error("We couldn't sign you out.");
      return;
    }

    useWishlistStore.getState().clear();
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
          <SectionHeading
            eyebrow="Delivery details"
            title="Saved addresses"
            action={
              <Button
                variant="outline"
                className="rounded-full"
                onClick={openAddAddress}
                disabled={addressEditorOpen}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add new address
              </Button>
            }
          />

          {addressEditorOpen && (
            <AddressForm
              form={addressForm}
              editing={Boolean(editingAddress)}
              saving={addressSaving}
              error={addressError}
              onChange={updateAddressField}
              onSave={() => void saveAddress()}
              onCancel={closeAddressEditor}
            />
          )}

          {addresses.length === 0 ? (
            <EmptyPanel
              icon={<MapPin className="h-6 w-6" />}
              title="No saved addresses"
              description="Add an address for faster and easier checkout."
            />
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  deleting={addressDeletingId === address.id}
                  settingDefault={addressDefaultId === address.id}
                  onEdit={() => openEditAddress(address)}
                  onDelete={() => void deleteAddress(address)}
                  onSetDefault={() => void setDefaultAddress(address)}
                />
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

function AddressForm({
  form,
  editing,
  saving,
  error,
  onChange,
  onSave,
  onCancel,
}: {
  form: {
    label: string;
    full_name: string;
    phone: string;
    line1: string;
    line2: string;
    landmark: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    address_type: "shipping" | "billing";
    is_default: boolean;
  };
  editing: boolean;
  saving: boolean;
  error: string | null;
  onChange: (field: keyof typeof form, value: string | boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-border/60 bg-white p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-gold">
            {editing ? "Update address" : "New address"}
          </p>
          <h3 className="mt-2 font-display text-2xl">
            {editing ? "Edit your address" : "Add a saved address"}
          </h3>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={onCancel}
          disabled={saving}
          aria-label="Close address form"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="address-label">Address label</Label>
          <Input
            id="address-label"
            value={form.label}
            onChange={(event) => onChange("label", event.target.value)}
            placeholder="Home, Office, etc."
            className="mt-2 h-11 rounded-xl"
            maxLength={60}
          />
        </div>

        <div>
          <Label htmlFor="address-type">Address type</Label>
          <select
            id="address-type"
            value={form.address_type}
            onChange={(event) =>
              onChange("address_type", event.target.value as "shipping" | "billing")
            }
            className="mt-2 flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="shipping">Shipping</option>
            <option value="billing">Billing</option>
          </select>
        </div>

        <div>
          <Label htmlFor="address-full-name">Full name</Label>
          <Input
            id="address-full-name"
            value={form.full_name}
            onChange={(event) => onChange("full_name", event.target.value)}
            className="mt-2 h-11 rounded-xl"
            maxLength={120}
            required
          />
        </div>

        <div>
          <Label htmlFor="address-phone">Phone</Label>
          <Input
            id="address-phone"
            value={form.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            className="mt-2 h-11 rounded-xl"
            maxLength={30}
            inputMode="tel"
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="address-line1">Address line 1</Label>
          <Input
            id="address-line1"
            value={form.line1}
            onChange={(event) => onChange("line1", event.target.value)}
            className="mt-2 h-11 rounded-xl"
            maxLength={200}
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="address-line2">Address line 2</Label>
          <Input
            id="address-line2"
            value={form.line2}
            onChange={(event) => onChange("line2", event.target.value)}
            className="mt-2 h-11 rounded-xl"
            maxLength={200}
          />
        </div>

        <div>
          <Label htmlFor="address-landmark">Landmark</Label>
          <Input
            id="address-landmark"
            value={form.landmark}
            onChange={(event) => onChange("landmark", event.target.value)}
            className="mt-2 h-11 rounded-xl"
            maxLength={120}
          />
        </div>

        <div>
          <Label htmlFor="address-city">City</Label>
          <Input
            id="address-city"
            value={form.city}
            onChange={(event) => onChange("city", event.target.value)}
            className="mt-2 h-11 rounded-xl"
            maxLength={80}
            required
          />
        </div>

        <div>
          <Label htmlFor="address-state">State</Label>
          <Input
            id="address-state"
            value={form.state}
            onChange={(event) => onChange("state", event.target.value)}
            className="mt-2 h-11 rounded-xl"
            maxLength={80}
            required
          />
        </div>

        <div>
          <Label htmlFor="address-postal-code">Postal code</Label>
          <Input
            id="address-postal-code"
            value={form.postal_code}
            onChange={(event) => onChange("postal_code", event.target.value)}
            className="mt-2 h-11 rounded-xl"
            maxLength={20}
            inputMode="numeric"
            required
          />
        </div>

        <div>
          <Label htmlFor="address-country">Country</Label>
          <Input
            id="address-country"
            value={form.country}
            onChange={(event) => onChange("country", event.target.value)}
            className="mt-2 h-11 rounded-xl"
            maxLength={2}
            required
          />
        </div>
      </div>

      <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 p-4">
        <input
          type="checkbox"
          checked={form.is_default}
          onChange={(event) => onChange("is_default", event.target.checked)}
          className="h-4 w-4 rounded border-border accent-gold"
        />
        <span>
          <span className="block text-sm font-medium">Make this my default address</span>
          <span className="mt-1 block text-xs text-muted-foreground">
            Use this address automatically for future checkout.
          </span>
        </span>
      </label>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          className="rounded-full"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="rounded-full bg-charcoal text-white hover:bg-charcoal/90"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Saving…" : editing ? "Save changes" : "Save address"}
        </Button>
      </div>
    </div>
  );
}

function AddressCard({
  address,
  deleting,
  settingDefault,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: NexusAddress;
  deleting: boolean;
  settingDefault: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  return (
    <article className="rounded-2xl border border-border/60 bg-white p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl">{address.label || "Saved address"}</h3>

            {address.is_default && (
              <span className="inline-flex items-center gap-1 rounded-full bg-beige px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-charcoal">
                <Check className="h-3 w-3" />
                Default
              </span>
            )}
          </div>

          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {address.address_type}
          </p>
        </div>

        <MapPin className="h-5 w-5 shrink-0 text-gold" />
      </div>

      <div className="mt-5 space-y-1.5 text-sm">
        <p className="font-medium">{address.full_name}</p>
        <p>{address.phone}</p>
        <p>{address.line1}</p>

        {address.line2 && <p>{address.line2}</p>}
        {address.landmark && <p className="text-muted-foreground">Near {address.landmark}</p>}

        <p>
          {address.city}, {address.state} {address.postal_code}
        </p>
        <p>{address.country}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-border/50 pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={onEdit}
          disabled={deleting || settingDefault}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>

        {!address.is_default && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={onSetDefault}
            disabled={deleting || settingDefault}
          >
            {settingDefault ? "Updating…" : "Set as default"}
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full text-destructive hover:text-destructive"
          onClick={onDelete}
          disabled={deleting || settingDefault}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </div>
    </article>
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
