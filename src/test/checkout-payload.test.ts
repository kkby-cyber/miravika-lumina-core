import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();
const getSession = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getSession: (...args: unknown[]) => getSession(...args) } },
}));

const { createNexusCheckout, NexusApiError } = await import("../lib/nexus");

const ADDRESS = {
  full_name: "Aarav Sharma",
  phone: "9876543210",
  line1: "12 Marine Drive",
  city: "Mumbai",
  state: "Maharashtra",
  postal_code: "400001",
  country: "IN",
};

function okResponse(data: unknown) {
  return { ok: true, status: 200, json: async () => ({ success: true, data }) };
}

describe("createNexusCheckout", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    getSession.mockReset();
    getSession.mockResolvedValue({ data: { session: null } });
    window.localStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("posts to the configured Nexus base URL, not a same-origin path", async () => {
    fetchMock.mockResolvedValue(
      okResponse({
        order_id: "o1",
        order_number: "MIR-1001",
        totals: { total: 1499 },
        razorpay: {},
      }),
    );

    await createNexusCheckout({
      email: "a@example.com",
      phone: "9876543210",
      full_name: "Aarav Sharma",
      items: [{ sku: "SKU-1", quantity: 2 }],
      shipping_address: ADDRESS,
      billing_same_as_shipping: true,
    });

    const [url] = fetchMock.mock.calls[0];
    // Must be an absolute Nexus URL ending in the real checkout path.
    expect(String(url)).toMatch(/\/api\/public\/checkout$/);
    expect(String(url).startsWith("http")).toBe(true);
  });

  it("sends only identifiers, quantities and contact details", async () => {
    fetchMock.mockResolvedValue(okResponse({ order_id: "o1", razorpay: {} }));

    await createNexusCheckout({
      email: "a@example.com",
      phone: "9876543210",
      full_name: "Aarav Sharma",
      items: [{ sku: "SKU-1", quantity: 2 }],
      shipping_address: ADDRESS,
      billing_same_as_shipping: true,
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);

    // Line items carry no price, tax, discount or inventory claims.
    expect(body.items).toEqual([{ sku: "SKU-1", quantity: 2 }]);

    // The browser never asserts money or fulfilment state.
    for (const forbidden of [
      "total",
      "subtotal",
      "totals",
      "tax",
      "shipping_total",
      "discount",
      "payment_status",
      "order_status",
      "inventory",
    ]) {
      expect(body).not.toHaveProperty(forbidden);
    }
  });

  it("includes the billing and address fields Nexus requires", async () => {
    fetchMock.mockResolvedValue(okResponse({ order_id: "o1", razorpay: {} }));

    await createNexusCheckout({
      email: "a@example.com",
      phone: "9876543210",
      full_name: "Aarav Sharma",
      items: [{ sku: "SKU-1", quantity: 1 }],
      shipping_address: ADDRESS,
      billing_same_as_shipping: true,
      coupon_code: "MIRA10",
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.email).toBe("a@example.com");
    expect(body.billing_same_as_shipping).toBe(true);
    expect(body.shipping_address).toMatchObject({ city: "Mumbai", postal_code: "400001" });
    expect(body.coupon_code).toBe("MIRA10");
  });

  it("attaches the customer bearer token when signed in", async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: "jwt" } } });
    fetchMock.mockResolvedValue(okResponse({ order_id: "o1", razorpay: {} }));

    await createNexusCheckout({
      email: "a@example.com",
      phone: "9876543210",
      full_name: "Aarav Sharma",
      items: [{ sku: "SKU-1", quantity: 1 }],
      shipping_address: ADDRESS,
      billing_same_as_shipping: true,
    });

    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer jwt");
  });

  it("surfaces the backend code and a safe message on rejection", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        success: false,
        error: { code: "OUT_OF_STOCK", message: "This product is no longer available." },
      }),
    });

    const error = await createNexusCheckout({
      email: "a@example.com",
      phone: "9876543210",
      full_name: "Aarav Sharma",
      items: [{ sku: "SKU-1", quantity: 99 }],
      shipping_address: ADDRESS,
      billing_same_as_shipping: true,
    }).catch((e) => e);

    expect(error).toBeInstanceOf(NexusApiError);
    expect(error.code).toBe("OUT_OF_STOCK");
    expect(error.status).toBe(409);
  });

  it("raises a network error instead of leaking a raw fetch failure", async () => {
    fetchMock.mockRejectedValue(new Error("Failed to fetch"));

    const error = await createNexusCheckout({
      email: "a@example.com",
      phone: "9876543210",
      full_name: "Aarav Sharma",
      items: [{ sku: "SKU-1", quantity: 1 }],
      shipping_address: ADDRESS,
      billing_same_as_shipping: true,
    }).catch((e) => e);

    expect(error).toBeInstanceOf(NexusApiError);
    expect(error.code).toBe("NETWORK_UNAVAILABLE");
    // No stack trace or transport detail is shown to the customer.
    expect(error.message).not.toContain("Failed to fetch");
  });
});
