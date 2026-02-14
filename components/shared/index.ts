/**
 * Shared Components
 *
 * Reusable components that can be used across the application.
 */

// Web3 Error Handling
export {
  // Components
  ErrorDisplay,
  // Hooks
  useWeb3Error,
  useWeb3Transaction,
  // Toast helpers
  showSuccessToast,
  showPendingToast,
  updateToastSuccess,
  updateToastError,
  dismissToast,
  // Re-exports from utils
  parseWeb3Error,
  isUserRejectionError,
} from "./Web3ErrorHandler";

export type {
  // Types
  ErrorDisplayProps,
  UseWeb3ErrorOptions,
  UseWeb3ErrorReturn,
  UseWeb3TransactionOptions,
  UseWeb3TransactionReturn,
  TransactionState,
  ParsedWeb3Error,
} from "./Web3ErrorHandler";

// Markdown
export { MarkdownRenderer } from "./MarkdownRenderer";
export type { MarkdownRendererProps } from "./MarkdownRenderer";

export { MarkdownEditor } from "./MarkdownEditor";
export type { MarkdownEditorProps } from "./MarkdownEditor";

// Network Badge
export { NetworkBadge, CURRENT_NETWORK } from "./NetworkBadge";
export type { NetworkConfig } from "./NetworkBadge";

// Network Switcher
export { NetworkSwitcher } from "./NetworkSwitcher";
export type { NetworkSwitcherProps } from "./NetworkSwitcher";

// Page Header
export { PageHeader } from "./PageHeader";

// Announcement Banner
export { AnnouncementBanner } from "./AnnouncementBanner";
export type { AnnouncementBannerProps } from "./AnnouncementBanner";

// Version Info
export { VersionInfo } from "./VersionInfo";

// Network Banner
export { NetworkBanner } from "./NetworkBanner";
export type { NetworkBannerProps } from "./NetworkBanner";
