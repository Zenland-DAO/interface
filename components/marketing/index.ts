/**
 * Marketing Components
 *
 * Components specific to the marketing/landing pages.
 */

export { Header } from "./Header";
export { Footer } from "./Footer";
export { FeaturesSection } from "./FeaturesSection";
// ProtocolStatsSection is intentionally not exported here: it pulls in the SDK, viem and
// react-query, so it is only loaded lazily through ProtocolStatsSectionClient.
export { SupportedNetworksSection } from "./SupportedNetworksSection";
export { HeroEscrowCard } from "./HeroEscrowCard";
export { WalletSupportSection } from "./WalletSupportSection";
export { BentoGridSection } from "./BentoGridSection";
export { CommunitySection } from "./CommunitySection";
export { LanguageSwitcher } from "./LanguageSwitcher";
export { OpenBookSection } from "./OpenBookSection";
export { FAQSection } from "./FAQSection";
export { TutorialVideoSection } from "./TutorialVideoSection";
