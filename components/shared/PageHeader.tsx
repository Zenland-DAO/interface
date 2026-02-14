import { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Heading, Text } from "@/components/ui";

/**
 * PageHeader Component
 *
 * Unified page header layout for consistent structure across all app pages.
 * Follows DRY and SOLID principles by centralizing header styling and layout.
 *
 * Features:
 * - Consistent typography using Heading and Text components
 * - Mobile-responsive: stacks vertically on mobile, side-by-side on desktop
 * - Optional actions slot for CTA buttons
 * - Optional back link for sub-pages
 * - Prevents CTA button squeezing on mobile
 *
 * @example Basic usage
 * <PageHeader
 *   title="Dashboard"
 *   description="Welcome back! Here's an overview."
 * />
 *
 * @example With actions
 * <PageHeader
 *   title="My Escrows"
 *   description="View and manage your escrow contracts"
 *   actions={<Button>Create Escrow</Button>}
 * />
 *
 * @example With back link
 * <PageHeader
 *   backLink={{ href: "/escrows", label: "Back to Escrows" }}
 *   title="Create New Escrow"
 *   description="Set up a secure escrow contract"
 * />
 */

interface BackLinkProps {
  /** URL to navigate to */
  href: string;
  /** Label for the back link */
  label: string;
}

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional description text below the title */
  description?: string;
  /** Optional slot for action buttons (CTAs) */
  actions?: ReactNode;
  /** Optional back link for sub-pages */
  backLink?: BackLinkProps;
  /** Additional className for the container */
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  backLink,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={className}>
      {backLink && (
        <Link
          href={backLink.href}
          className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4"
        >
          <ChevronLeft size={16} />
          {backLink.label}
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Heading level={1} className="text-2xl font-bold">
            {title}
          </Heading>
          {description && (
            <Text variant="muted" className="mt-1">
              {description}
            </Text>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
