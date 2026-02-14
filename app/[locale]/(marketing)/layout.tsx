import { ReactNode } from "react";
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
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
