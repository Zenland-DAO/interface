"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Globe, Lock, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";

/**
 * HeroEscrowCard - Refined Mock Component
 *
 * An auto-playing animated preview of the escrow lifecycle.
 * Cycles through Creation, Protection, and Settlement.
 */
export function HeroEscrowCard() {
  const t = useTranslations("marketing.heroCard");

  const [step, setStep] = useState(0);
  const totalSteps = 3;

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % totalSteps);
    }, 4000); // Change step every 4 seconds
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { id: "creation", label: t("steps.creation.label"), status: t("steps.creation.status"), statusColor: "success" },
    { id: "protection", label: t("steps.protection.label"), status: t("steps.protection.status"), statusColor: "primary" },
    { id: "settlement", label: t("steps.settlement.label"), status: t("steps.settlement.status"), statusColor: "success" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full max-w-[400px] mx-auto bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl shadow-2xl overflow-hidden h-[540px] flex flex-col"
      layout
    >
      {/* Animated Glow Border */}
      <motion.div
        animate={{
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-primary-500/10 -z-10 rounded-3xl blur-2xl"
      />

      <div className="p-6 space-y-4 flex-1 flex flex-col min-h-0">
        {/* Header with Status Trackers */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                    i === step ? "bg-primary-500" : "bg-[var(--text-disabled)]/20"
                  }`}
                />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={step}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]"
              >
                {steps[step].label}
              </motion.span>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                steps[step].statusColor === "success"
                  ? "bg-success-500/10 border-success-500/20 text-success-500"
                  : "bg-primary-500/10 border-primary-500/20 text-primary-500"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${
                steps[step].statusColor === "success" ? "bg-success-500" : "bg-primary-500"
              } animate-pulse`} />
              <span className="text-[10px] font-bold uppercase">{steps[step].status}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] rounded-2xl p-4">
                  <p className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] mb-2 tracking-wider">{t("send.label")}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight">2,500</span>
                      <span className="text-sm font-semibold text-[var(--text-tertiary)]">USDC</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-bold shadow-lg shadow-blue-500/20">U</div>
                  </div>
                </div>

                <div className="flex justify-center relative py-1">
                  <div className="p-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-secondary)] shadow-sm z-10">
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] rotate-90" />
                  </div>
                </div>

                <div className="bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">{t("recipient.label")}</p>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-500">
                      <Globe className="w-2.5 h-2.5" />
                      <span className="text-[9px] font-bold">{t("send.network")}</span>
                    </div>
                  </div>
                  <p className="font-mono text-xs text-[var(--text-secondary)] truncate">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</p>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="h-full flex flex-col items-center justify-center space-y-6 py-8"
              >
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-primary-500 rounded-full blur-xl"
                  />
                  <div className="relative w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-xl shadow-primary-500/30">
                    <Lock className="w-8 h-8" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h4 className="text-xl font-bold">{t("secured.title")}</h4>
                  <p className="text-sm text-[var(--text-secondary)] max-w-[200px]">
                    {t("secured.description", { amount: "2,500 USDC" })}
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col items-center justify-center space-y-6 py-8"
              >
                <div className="w-20 h-20 rounded-full bg-success-500 flex items-center justify-center text-white shadow-xl shadow-success-500/30">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="text-center space-y-2">
                  <h4 className="text-xl font-bold">{t("released.title")}</h4>
                  <p className="text-sm text-[var(--text-secondary)]">{t("released.description")}</p>
                  <div className="pt-4">
                    <span className="text-[10px] font-bold text-success-500 uppercase tracking-widest border border-success-500/30 px-3 py-1 rounded-full">
                      {t("released.badge")}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Metrics / Action Button Area */}
        <div className="space-y-4 pt-4 border-t border-[var(--border-secondary)]/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={step === 0 ? "metrics" : "completed"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-2 gap-3"
            >
              {step === 0 ? (
                <>
                  <div className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)]/30 border border-transparent flex flex-col items-center">
                    <span className="text-[9px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">{t("metrics.gasFee")}</span>
                    <span className="text-xs font-bold font-mono text-success-500">~$0.14</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)]/30 border border-transparent flex flex-col items-center">
                    <span className="text-[9px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">{t("metrics.platform")}</span>
                    <span className="text-xs font-bold text-[var(--text-primary)]">1% ($25.00)</span>
                  </div>
                </>
              ) : (
                <div className="col-span-2 px-3 py-2 rounded-xl bg-success-500/5 border border-success-500/10 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-success-500" />
                  <span className="text-[10px] font-bold text-success-500 uppercase">{t("metrics.verified")}</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <Button
            className={`w-full py-6 rounded-2xl font-bold text-base transition-all duration-500 ${
              step === 2 ? "bg-success-500 hover:bg-success-600" : ""
            }`}
          >
            {step === 0 && t("buttons.start")}
            {step === 1 && t("buttons.verifying")}
            {step === 2 && t("buttons.completed")}
            {step === 0 && <ShieldCheck className="ml-2 w-4 h-4" />}
          </Button>

          <div className="flex items-center justify-center gap-6 opacity-40">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-warning-500" />
              <span className="text-[8px] font-bold uppercase tracking-tight">{t("badges.zeroTrust")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-primary-500" />
              <span className="text-[8px] font-bold uppercase tracking-tight">{t("badges.encrypted")}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
