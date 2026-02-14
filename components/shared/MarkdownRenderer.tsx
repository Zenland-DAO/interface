"use client";

import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";

export interface MarkdownRendererProps {
  /** Raw markdown content */
  content: string;
  /** Optional wrapper classes for spacing/typography */
  className?: string;
}

type AllowedProtocol = "http:" | "https:" | "mailto:";

function isSafeHref(href: string | undefined): href is string {
  if (!href) return false;

  // Allow in-page and relative links.
  if (href.startsWith("#") || href.startsWith("/")) return true;

  // Only allow explicit safe protocols for absolute URLs.
  try {
    const url = new URL(href);
    const protocol = url.protocol as AllowedProtocol;
    return protocol === "http:" || protocol === "https:" || protocol === "mailto:";
  } catch {
    return false;
  }
}

const markdownComponents: Components = {
  // Headings (we only expect ###, but styling all is fine)
  h1: ({ children, ...props }) => (
    <h1 className="text-sm font-medium text-[var(--text-primary)] mt-3 mb-2" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-sm font-medium text-[var(--text-primary)] mt-3 mb-2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-sm font-medium text-[var(--text-primary)] mt-3 mb-2" {...props}>
      {children}
    </h3>
  ),

  p: ({ children, ...props }) => (
    <p className="text-sm leading-relaxed text-[var(--text-secondary)] mb-2 last:mb-0" {...props}>
      {children}
    </p>
  ),

  ul: ({ children, ...props }) => (
    <ul className="list-disc pl-5 text-sm text-[var(--text-secondary)] space-y-1 mb-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal pl-5 text-sm text-[var(--text-secondary)] space-y-1 mb-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),

  // Remove special code styling: render code as plain text.
  code: ({ children }) => <>{children}</>,
  pre: ({ children }) => <>{children}</>,

  a: ({ href, children, ...props }) => {
    const safe = isSafeHref(href);
    if (!safe) {
      // If unsafe, render the label without a link.
      return <span className="text-[var(--text-secondary)]">{children}</span>;
    }

    const isExternal = href?.startsWith("http") || href?.startsWith("mailto:");

    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-primary-600 dark:text-primary-400 hover:underline"
        {...props}
      >
        {children}
      </a>
    );
  },

  // Disallow images entirely.
  img: () => null,
};

/**
 * Safe markdown renderer:
 * - no raw HTML (we do not enable `rehypeRaw`)
 * - blocks images
 * - only allows http/https/mailto + relative/hash links
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content?.trim()) return null;

  return (
    <div className={className}>
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
}
