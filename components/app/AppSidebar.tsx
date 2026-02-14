"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/ui";
import { ConnectedWallet } from "@/components/wallet";

import { APP_NAV_ITEMS } from "./navItems";
import { SidebarBanner } from "./SidebarBanner";
import { UserProfile } from "./UserProfile";

type AppSidebarProps = {
  /**
   * Used by the mobile drawer to close the drawer after navigation.
   * Desktop sidebar can omit this.
   */
  onNavigate?: () => void;
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full w-full overflow-hidden border-r border-[var(--border-secondary)] bg-[var(--bg-secondary)]">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-[var(--border-secondary)] overflow-hidden">
        <Link
          href="/app"
          onClick={onNavigate}
          className="overflow-hidden"
        >
          <Logo size="sm" asLink={false} />
        </Link>
      </div>

      {/* User Profile Summary */}
      <UserProfile />

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-none">
        {APP_NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? "bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)] text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--state-hover)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Promo Banner */}
      <SidebarBanner />

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[var(--border-secondary)] bg-[var(--bg-secondary)]">
        <ConnectedWallet variant="sidebar" />
      </div>
    </aside>
  );
}
