import { ReactNode } from "react";
import { preload } from "react-dom";
import { Header, Footer } from "@/components/marketing";

interface MarketingLayoutProps {
  children: ReactNode;
}

/**
 * Marketing Layout (Localized)
 *
 * Layout for marketing pages with header and footer.
 * Wrapped by the locale layout which provides translations.
 */
export default function MarketingLayout({ children }: MarketingLayoutProps) {
  // Preload the logo so the browser fetches it at the highest priority,
  // fixing the LCP "fetchpriority=high should be applied" PageSpeed warning.
  preload("/branding/logo/svg/logo-light.svg", { as: "image", fetchPriority: "high" });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
