import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",
  
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
    // loading a *second copy* of React and/or React Query from the linked package's node_modules.
    // That breaks context singletons (React Query throws: "No QueryClient set...").
    //
    // These settings force a single instance by resolving everything to this app's node_modules.
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
    };

    // Allow importing `.graphql` documents as raw strings.
    // This keeps our queries DRY: the same files power codegen AND runtime fetches.
    config.module.rules.push({
      test: /\.graphql$/,
      type: "asset/source",
    });

    return config;
  },
  transpilePackages: ["@wagmi/connectors", "wagmi", "viem", "@zenland/sdk"],
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: "zenland-td",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
});
