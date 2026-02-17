"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container, Logo, Text } from "@/components/ui";
import { VersionInfo } from "@/components/shared";

/**
 * Marketing Footer Component
 * 
 * The main footer for marketing pages.
 * Includes logo, navigation links, and copyright.
 */

interface FooterLink {
  labelKey: string;
  href: string;
}

interface FooterSection {
  titleKey: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    titleKey: "product.title",
    links: [
      { labelKey: "product.features", href: "#features" },
      { labelKey: "product.howItWorks", href: "#how-it-works" },
      { labelKey: "product.community", href: "#community" },
      { labelKey: "product.faq", href: "https://docs.zen.land/resources/faq" },
    ],
  },
  {
    titleKey: "resources.title",
    links: [
      { labelKey: "resources.documentation", href: "https://docs.zen.land/" },
      { labelKey: "resources.apiReference", href: "https://api.zen.land/" },
      { labelKey: "resources.contracts", href: "https://github.com/zenland-dao/core" },
      { labelKey: "resources.blog", href: "https://zen.land/blog" },
    ],
  },
  {
    titleKey: "legal.title",
    links: [
      { labelKey: "legal.privacy", href: "/privacy" },
      { labelKey: "legal.terms", href: "/terms" },
      { labelKey: "legal.agentTos", href: "/agent-tos" },
    ],
  },
];

const socialLinks = [
  {
    label: "Twitter",
    href: "https://x.com/zenland_app",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/zenland-dao",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
];

export function Footer() {
  const t = useTranslations("common.footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-secondary)] bg-[var(--bg-secondary)]">
      <Container className="py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Logo size="lg" asLink={false} />
            <Text variant="muted" className="mt-4 max-w-sm">
              {t("tagline")}
            </Text>
            
            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            
            {/* Version Info */}
            <VersionInfo className="mt-4" />
          </div>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <div key={section.titleKey}>
              <h4 className="font-semibold text-[var(--text-primary)] mb-4">
                {t(`sections.${section.titleKey}`)}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {t(`sections.${link.labelKey}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--border-secondary)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Text variant="small" className="text-[var(--text-tertiary)]">
              {t("copyright", { year: currentYear })}
            </Text>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {t("bottomLinks.privacy")}
              </Link>
              <Link
                href="/terms"
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {t("bottomLinks.terms")}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
