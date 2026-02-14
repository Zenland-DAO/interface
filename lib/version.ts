/**
 * Version and Build Information
 * 
 * VERSION: Pulled from package.json at build time
 * COMMIT_HASH: Injected via NEXT_PUBLIC_COMMIT_HASH env var in CI
 *              Falls back to "dev" for local development
 * 
 * Usage in CI (GitHub Actions example):
 *   NEXT_PUBLIC_COMMIT_HASH: ${{ github.sha }}
 */

import packageJson from "@/package.json";

/** Application version from package.json */
export const VERSION = packageJson.version;

/** 
 * Git commit hash (7 chars)
 * - In production: injected via NEXT_PUBLIC_COMMIT_HASH
 * - In development: "dev"
 */
export const COMMIT_HASH = process.env.NEXT_PUBLIC_COMMIT_HASH?.slice(0, 7) || "dev";

/** Full commit hash if available */
export const COMMIT_HASH_FULL = process.env.NEXT_PUBLIC_COMMIT_HASH || "";

/** Whether this is a development build */
export const IS_DEV_BUILD = COMMIT_HASH === "dev";

/** GitHub repository URL for the interface */
export const GITHUB_REPO_URL = "https://github.com/Zenland-DAO/interface";

/** Get the commit URL on GitHub */
export const getCommitUrl = (hash: string = COMMIT_HASH_FULL): string | null => {
  if (!hash || hash === "dev") return null;
  return `${GITHUB_REPO_URL}/commit/${hash}`;
};
