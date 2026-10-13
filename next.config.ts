import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  experimental: {
    // Marketing (`app/[locale]`) and the dApp (`app/(app)`) are separate root layouts,
    // so unmatched URLs need a self-contained 404 document: app/global-not-found.tsx.
    globalNotFound: true,
  },

  // Long-lived cache for static branding assets (SVGs are content-addressed via deploys)
  async headers() {
    return [
      {
        source: "/branding/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // Image optimization configuration for better LCP
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  onDemandEntries: {
    // Keep pages in memory for 1 hour (default is ~15-60s)
    maxInactiveAge: 60 * 60 * 1000,
    // Keep up to 50 pages in memory (default is 2-4)
    pagesBufferLength: 50,
  },
  webpack: (config) => {
    // When using `npm link` / symlinked packages (e.g. `@zenland/sdk`), Node/webpack can end up
    // loading a *second copy* of React and/or React Query from the linked package’s node_modules.
    // That breaks context singletons (React Query throws: "No QueryClient set...").
    //
    // These settings force a single instance by resolving everything to this app’s node_modules.
    config.resolve.symlinks = false;

    // NOTE: aliasing only `react` is not enough. Next (and dependencies) can import
    // `react/jsx-runtime`, `react-dom/client`, etc. If those resolve to a different copy,
    // you’ll get "Invalid hook call".
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),

      // React
      "react$": require.resolve("react"),
      "react/jsx-runtime$": require.resolve("react/jsx-runtime"),
      "react/jsx-dev-runtime$": require.resolve("react/jsx-dev-runtime"),

      // ReactDOM
      "react-dom$": require.resolve("react-dom"),
      "react-dom/client$": require.resolve("react-dom/client"),
      "react-dom/server$": require.resolve("react-dom/server"),

      // React Query
      "@tanstack/react-query$": require.resolve("@tanstack/react-query"),

      // Neutralize optional x402 micropayment modules pulled in transitively via
      // @base-org/account → @coinbase/cdp-sdk. These `@x402/*` packages are optional
      // peer deps we never install or use (escrow flows don't touch x402), but their
      // lazy imports otherwise fail the build with "Module not found".
      // Resolving them to `false` maps them to an empty module.
      "@x402/core/client": false,
      "@x402/evm": false,
      "@x402/evm/exact/client": false,
      "@x402/evm/upto/client": false,
      "@x402/svm/exact/client": false,

      // Neutralize wagmi's experimental "Tempo" connector, which does
      // `import(/* turbopackOptional: true */ "accounts")`. The `turbopackOptional`
      // hint is understood by Turbopack but NOT by webpack, so webpack tries to
      // resolve the optional `accounts` package (which we don't install or use) and
      // fails. Map it to an empty module.
      "accounts": false,

      // Neutralize wagmi's optional "Porto" connector, which imports `porto/internal`.
      // Porto is not installed and unused by our wallet setup; map it to an empty module
      // to avoid a "Module not found" warning/error during the build.
      "porto/internal": false,
      "porto": false,
    };

    // Allow importing `.graphql` documents as raw strings.
    // This keeps our queries DRY: the same files power codegen AND runtime fetches.
    config.module.rules.push({
      test: /\.graphql$/,
      type: "asset/source",
    });

    return config;
  },
  transpilePackages: ["@wagmi/connectors", "wagmi", "@zenland/sdk"],
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: "zenland-td",
  project: "interface",
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload dependency source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Strip the SDK's internal debug logging from the client bundle.
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },
});
