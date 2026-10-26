import Script from "next/script";

/**
 * Microsoft Clarity (session recordings + heatmaps).
 *
 * Same loading strategy as GoogleAnalytics: the `clarity()` queue stub runs after
 * hydration so events from lib/analytics/gtag are buffered, and the tag itself
 * loads once the page is idle. Rendered only when NEXT_PUBLIC_CLARITY_PROJECT_ID
 * is set (see RootDocument).
 */
export function MicrosoftClarity({ projectId }: { projectId: string }) {
  return (
    <>
      <Script id="clarity-init" strategy="afterInteractive">
        {`
          window.clarity = window.clarity || function(){(window.clarity.q = window.clarity.q || []).push(arguments)};
        `}
      </Script>
      <Script id="clarity" src={`https://www.clarity.ms/tag/${projectId}`} strategy="lazyOnload" />
    </>
  );
}
