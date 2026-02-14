"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAV_ITEMS } from "./navItems";

const MOBILE_NAV_IDS = ["dashboard", "escrows", "agents", "verify"] as const;

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppMobileNav() {
  const pathname = usePathname();

  const items = APP_NAV_ITEMS.filter((i) =>
    (MOBILE_NAV_IDS as readonly string[]).includes(i.id)
  );

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--border-secondary)] bg-[var(--bg-secondary)]">
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2 text-xs transition-colors ${
                active
                  ? "text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

