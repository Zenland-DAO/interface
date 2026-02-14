/**
 * UI Components Library
 *
 * Reusable, atomic UI components following DRY and SOLID principles.
 */

// Theme
export { ThemeToggle, ThemeToggleWithLabel } from "./ThemeToggle";

// Typography
export { Text } from "./Text";
export { Heading } from "./Heading";
export { Badge } from "./Badge";

// Layout
export { Container } from "./Container";
export { Divider } from "./Divider";

// Brand
export { Logo } from "./Logo";

// Icons
export { Icon } from "./Icon";

// Button
export { Button } from "./Button";

// Form
export { Input } from "./Input";
export { Checkbox } from "./Checkbox";

// Card
export { Card, CardHeader, CardBody, CardFooter } from "./Card";
export { FeatureCard } from "./FeatureCard";

// Wallet
export { WalletOption } from "./WalletOption";

// Feedback
export { Toaster, toast } from "./Toaster";
export { Tooltip, TooltipProvider } from "./Tooltip";
export { Dropdown, DropdownItem, DropdownDivider } from "./Dropdown";
export { Select } from "./Select";
export type { SelectOption } from "./Select";
export { NumberInput } from "./NumberInput";
export { Modal, ModalHeader, ModalBody, ModalFooter } from "./Modal";

// Layout
export { BaseHeader } from "./BaseHeader";

// Loading & Error States
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonInput,
  SkeletonButton,
  SkeletonForm,
  SkeletonWizardProgress,
  SkeletonEscrowWizard,
} from "./Skeleton";
export type { SkeletonProps, SkeletonVariant } from "./Skeleton";

export {
  ErrorBoundary,
  MinimalErrorFallback,
  AsyncBoundary,
} from "./ErrorBoundary";
export type {
  ErrorBoundaryProps,
  FallbackProps,
  MinimalErrorFallbackProps,
  AsyncBoundaryProps,
} from "./ErrorBoundary";
