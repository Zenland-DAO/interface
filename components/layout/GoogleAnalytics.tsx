import Script from "next/script";

/**
 * Google Analytics 4.
 *
 * Replaces `@next/third-parties/google`'s component, whose `afterInteractive` script
 * is preloaded in <head>: on mobile the ~190 KB gtag.js then competes with the page's
 * own CSS, fonts and JS. Here the tiny `gtag()` stub runs right after hydration (so
 * events queue in `dataLayer`), and gtag.js itself loads once the page is idle.
 * Page views on client-side navigations come from GA4 enhanced measurement
 * (browser history events), as before.
 */
export function GoogleAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
      <Script id="ga" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="lazyOnload" />
    </>
  );
}
