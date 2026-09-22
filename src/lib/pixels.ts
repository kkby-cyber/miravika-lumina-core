/**
 * MIRAVIKA marketing pixel layer (Phase 11).
 *
 * GTM (GTM-PVNR5BST) remains the single source of truth for GA4 + Google Ads.
 * These platform pixels load directly only when their ID is filled in below —
 * with an empty ID nothing is injected, so there are never phantom requests,
 * duplicate events or console errors before the accounts exist.
 *
 * To activate a channel, paste its ID here (they are public, client-side IDs).
 */
export const PIXEL_IDS = {
  metaPixel: "", // e.g. "1234567890"
  pinterestTag: "", // e.g. "2612345678901"
  tiktokPixel: "", // e.g. "CABCDEFGHIJKLMNO"
  snapPixel: "", // e.g. "1a2b3c4d-..."
  clarityProject: "", // Microsoft Clarity project id
  hotjarSiteId: "", // Hotjar site id (numeric)
} as const;

type PixelWindow = Window &
  Record<string, unknown> & {
    fbq?: (...args: unknown[]) => void;
    pintrk?: (...args: unknown[]) => void;
    ttq?: {
      track?: (...args: unknown[]) => void;
      page?: () => void;
    };
    snaptr?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    hj?: (...args: unknown[]) => void;
  };

type W = PixelWindow;

const injected = new Set<string>();

function script(key: string, code: string) {
  if (injected.has(key)) return;
  injected.add(key);
  const s = document.createElement("script");
  s.async = true;
  s.text = code;
  document.head.appendChild(s);
}

/** Loads every configured pixel once, after hydration. */
export function loadMarketingPixels() {
  if (typeof window === "undefined") return;

  if (PIXEL_IDS.metaPixel) {
    script(
      "meta",
      `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_IDS.metaPixel}');fbq('track','PageView');`,
    );
  }

  if (PIXEL_IDS.pinterestTag) {
    script(
      "pinterest",
      `!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk('load','${PIXEL_IDS.pinterestTag}');pintrk('page');`,
    );
  }

  if (PIXEL_IDS.tiktokPixel) {
    script(
      "tiktok",
      `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${PIXEL_IDS.tiktokPixel}');ttq.page()}(window,document,'ttq');`,
    );
  }

  if (PIXEL_IDS.snapPixel) {
    script(
      "snap",
      `(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u)})(window,document,'https://sc-static.net/scevent.min.js');snaptr('init','${PIXEL_IDS.snapPixel}');snaptr('track','PAGE_VIEW');`,
    );
  }

  if (PIXEL_IDS.clarityProject) {
    script(
      "clarity",
      `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${PIXEL_IDS.clarityProject}");`,
    );
  }

  if (PIXEL_IDS.hotjarSiteId) {
    script(
      "hotjar",
      `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${PIXEL_IDS.hotjarSiteId},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
    );
  }
}

/**
 * Mirrors a commerce event to any active platform pixel.
 *
 * `eventID` is Meta's de-duplication key: passing the real order id means a
 * browser Purchase and a future server-side CAPI Purchase collapse into one.
 */
export function pixelEvent(
  name:
    | "ViewContent"
    | "AddToCart"
    | "InitiateCheckout"
    | "Purchase"
    | "Search"
    | "AddToWishlist"
    | "Lead"
    | "CompleteRegistration",
  params: Record<string, unknown> = {},
  eventID?: string,
) {
  if (typeof window === "undefined") return;
  const w = window as W;
  try {
    w.fbq?.("track", name, params, eventID ? { eventID } : undefined);
    w.ttq?.track?.(name, params);
    w.pintrk?.("track", name.toLowerCase(), params);
    w.snaptr?.("track", name.toUpperCase(), params);
  } catch {
    /* pixels must never break the storefront */
  }
}
