"use client";

import { useScrollAnimation } from "@/hooks";
import { Heading, Text, Container, Button } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

// Wallet icons
import MetaMaskIcon from "@/public/assets/wallets/metamask-icon.svg";
import WalletConnectIcon from "@/public/assets/wallets/walletconnect-icon.svg";
import CoinbaseIcon from "@/public/assets/wallets/coinbase-icon.svg";
import TrustWalletIcon from "@/public/assets/wallets/trustwallet-icon.svg";
import RabbyIcon from "@/public/assets/wallets/rabby-icon.svg";
import OKXIcon from "@/public/assets/wallets/okx-icon.svg";
import LedgerIcon from "@/public/assets/wallets/ledger-icon.svg";
import BraveIcon from "@/public/assets/wallets/brave-icon.svg";
import NYKNYCIcon from "@/public/assets/wallets/nyknyc-icon.svg";

/**
 * NYKNYC benefits - gas-free features sponsored by Zenland
 */
const nyknycBenefitKeys = ["gasless", "agentFree", "escrowFree", "smartAccount"] as const;

/**
 * Other supported wallets
 */
const otherWallets = [
  { name: "MetaMask", icon: MetaMaskIcon },
  { name: "WalletConnect", icon: WalletConnectIcon },
  { name: "Coinbase", icon: CoinbaseIcon },
  { name: "Trust Wallet", icon: TrustWalletIcon },
  { name: "Rabby", icon: RabbyIcon },
  { name: "OKX", icon: OKXIcon },
  { name: "Ledger", icon: LedgerIcon },
  { name: "Brave", icon: BraveIcon },
];

export function WalletSupportSection() {
  const t = useTranslations("marketing.wallets");

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: spotlightRef, isVisible: spotlightVisible } = useScrollAnimation();
  const { ref: walletsRef, isVisible: walletsVisible } = useScrollAnimation();

  return (
    <section className="py-20 sm:py-24 lg:py-32 relative overflow-hidden">
      <Container className="relative">
        {/* Header */}
        <div
          ref={headerRef}
          className={`
            mb-16 transition-all duration-1000 ease-out
            ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
          `}
        >
          <Heading level={2} className="text-4xl sm:text-5xl lg:text-6xl mb-6">
            {t("title")}
          </Heading>
          <Text variant="lead" className="max-w-2xl text-[var(--text-secondary)]">
            {t("subtitle")}
          </Text>
        </div>

        {/* NYKNYC Spotlight Card */}
        <div
          ref={spotlightRef}
          className={`
            relative mb-16
            transition-all duration-1000 ease-out delay-200
            ${spotlightVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
          `}
        >
          {/* Gradient border effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-[#00beff] via-[#00beff]/50 to-[#00beff] rounded-[2rem] opacity-60" />
          
          <div className="relative bg-[var(--bg-primary)] rounded-[2rem] p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div className="relative">
                {/* Mobile: small logo top-right */}
                <div className="lg:hidden absolute top-0 right-0">
                  <Image
                    src={NYKNYCIcon}
                    alt="NYKNYC Wallet"
                    width={44}
                    height={44}
                    className="object-contain opacity-80"
                  />
                </div>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-[#00beff]/10 border border-[#00beff]/30">
                  <Sparkles className="w-4 h-4 text-[#00beff]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#00beff]">
                    {t("nyknyc.badge")}
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
                  {t("nyknyc.title")}
                </h3>
                <p className="text-lg text-[var(--text-secondary)] mb-8">
                  {t("nyknyc.description")}
                </p>

                {/* Benefits List */}
                <ul className="space-y-4 mb-8">
                  {nyknycBenefitKeys.map((benefitKey) => (
                    <li key={benefitKey} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#00beff] mt-0.5 flex-shrink-0" />
                      <span className="text-[var(--text-primary)]">{t(`nyknyc.benefits.${benefitKey}`)}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href="https://nyknyc.app/" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="group bg-[#00beff] hover:bg-[#00beff]/90">
                    {t("nyknyc.cta")}
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>

              {/* Right: Logo */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-[#00beff]/20 blur-3xl scale-150" />
                  <div className="relative transform transition-transform duration-500 hover:scale-105">
                    <Image
                      src={NYKNYCIcon}
                      alt="NYKNYC Wallet"
                      width={200}
                      height={200}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Wallets Grid */}
        <div
          ref={walletsRef}
          className={`
            transition-all duration-1000 ease-out delay-400
            ${walletsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
          `}
        >
          <Text className="text-center text-[var(--text-tertiary)] uppercase tracking-widest text-xs font-bold mb-8">
            {t("otherWallets")}
          </Text>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            {otherWallets.map((wallet) => (
              <div
                key={wallet.name}
                className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 hover:bg-[var(--bg-secondary)]/30"
                title={wallet.name}
              >
                <Image
                  src={wallet.icon}
                  alt={wallet.name}
                  width={40}
                  height={40}
                  className="object-contain opacity-70 hover:opacity-100 transition-opacity"
                />
                <span className="text-xs text-[var(--text-tertiary)]">{wallet.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
