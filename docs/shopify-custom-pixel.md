# MIRAVIKA — Shopify Customer Events → GTM purchase tracking

Shopify hosts the checkout, so the storefront code can never see a completed order.
The only reliable purchase signal is Shopify's own `checkout_completed` Customer Event.
This must be pasted **manually in Shopify Admin** — no app or API can do it from here.

## Where to paste

Shopify Admin → **Settings → Customer events** → **Add custom pixel** →
name it `MIRAVIKA GTM Purchase` → paste the code below → **Save** → **Connect**.

Permissions: Analytics = required, Marketing = required (so it runs for consenting shoppers).

## Code to paste

```js
// Loads GTM-PVNR5BST inside the Shopify checkout sandbox and reports the order once.
(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  var f = d.getElementsByTagName(s)[0], j = d.createElement(s);
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i;
  f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-PVNR5BST');

analytics.subscribe('checkout_completed', (event) => {
  var c = event.data.checkout;
  var id = c.order && c.order.id ? String(c.order.id) : String(c.token);

  // De-duplicate: one purchase per order id, even if the page is refreshed.
  try {
    var k = 'miravika_purchase_' + id;
    if (localStorage.getItem(k)) return;
    localStorage.setItem(k, '1');
  } catch (e) {}

  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: 'purchase',
    ecommerce: {
      transaction_id: id,
      value: c.totalPrice.amount,
      currency: c.currencyCode,
      tax: c.totalTax ? c.totalTax.amount : 0,
      shipping: c.shippingLine ? c.shippingLine.price.amount : 0,
      coupon: (c.discountApplications[0] || {}).title || undefined,
      items: c.lineItems.map(function (li) {
        return {
          item_id: li.variant && li.variant.sku ? li.variant.sku : String(li.variant && li.variant.id),
          item_name: li.title,
          item_variant: li.variant ? li.variant.title : undefined,
          price: li.variant ? li.variant.price.amount : undefined,
          quantity: li.quantity,
        };
      }),
    },
  });
});
```

## What must exist inside GTM-PVNR5BST

1. **GA4 Event tag** — event name `purchase`, "Send Ecommerce data" = Data Layer,
   trigger: Custom Event `purchase`.
2. **Google Ads Conversion tag** — Purchase conversion action; Value `{{DLV - ecommerce.value}}`,
   Currency `{{DLV - ecommerce.currency}}`, Transaction ID `{{DLV - ecommerce.transaction_id}}`,
   same `purchase` trigger. Transaction ID is what makes Ads count one conversion per order.
3. **Meta Purchase tag** (when the Meta pixel id is filled into `src/lib/pixels.ts`) —
   `eventID` = `{{DLV - ecommerce.transaction_id}}` for CAPI de-duplication.

All three fire only on `checkout_completed`, i.e. after a genuine paid Shopify order —
never on cart open, checkout click, payment failure or abandonment.

## Fallback already in the storefront

`/thank-you` still calls `trackPurchase()` when Shopify returns the shopper with
`?order_id=&value=&currency=`. It shares the same persistent `miravika_purchase_<id>`
guard as the pixel above, so the two surfaces can never double-count one order.
