"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Heading, Text, Container } from "@/components/ui";
import { Zap, Code } from "lucide-react";
import NextImage from "next/image";
import { AnimateOnScroll } from "@/hooks";

/**
 * BentoGridSection
 *
 * A modern, visually rich grid showcasing Zenland's USPs.
 * Features 3 distinct cards: 1% Fees (Hero), No Coding, and Instant Settlement.
 */
export function BentoGridSection() {
  const t = useTranslations("marketing.bento");

  return (
    <section className="py-24 sm:py-32 overflow-hidden">
      <Container>
        <AnimateOnScroll animation="fade-up" className="mb-16 lg:mb-20 max-w-2xl">
          <Heading level={2} className="mb-6">
            {t("title")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
              {t("titleHighlight")}
            </span>
          </Heading>
          <Text variant="lead" className="text-lg sm:text-xl text-[var(--text-secondary)]">
            {t("subtitle")}
          </Text>
        </AnimateOnScroll>

        {/* 3-Card Layout: Main Left, Two Stacked Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[340px] sm:auto-rows-[280px] gap-4 lg:gap-6">

          {/* Card 1: 1% Fees (Large Hero - Left) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="md:col-span-7 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/5 p-8 lg:p-12 flex flex-col justify-between"
          >
            <div className="relative z-20">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/20 text-primary-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md border border-primary-500/10">
                {t("fees.badge")}
              </span>
              <h3 className="text-[clamp(3.5rem,9vw,7rem)] font-bold text-white leading-[0.8] mb-6 tracking-tighter">
                1%<span className="text-primary-500">.</span>
              </h3>
              <div className="max-w-md">
                <p className="text-2xl font-bold text-white mb-3">{t("fees.title")}</p>
                <p className="text-slate-400 text-base leading-relaxed">
                  {t("fees.description")} <br />
                  {t("fees.descriptionSuffix")} <span className="text-primary-400 font-semibold">{t("fees.highlight")}</span>.
                </p>
              </div>
            </div>

            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <NextImage
                src="/images/bento-fees.webp"
                alt="1% Fees Abstract"
                fill
                className="object-cover object-right lg:object-center opacity-70 group-hover:opacity-90 transition-all duration-700"
                priority
                sizes="(max-width: 768px) 100vw, 58vw"
              />
            </div>

            {/* Gradient Overlay for Text Readability - placed behind content but above image */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-transparent" />

            <div className="relative z-10 mt-8 flex items-center gap-2 text-slate-500 text-xs font-mono uppercase tracking-tight">
              <span>{t("fees.footnote")}</span>
            </div>
          </motion.div>

          {/* Right Column Stack */}
          <div className="md:col-span-5 md:row-span-2 grid grid-rows-2 gap-4 lg:gap-6">

            {/* Card 2: No Coding (Top Right) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="relative group overflow-hidden rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-8 flex flex-col justify-center"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-warning-500/10 flex items-center justify-center">
                    <Code className="w-5 h-5 text-warning-500" />
                  </div>
                  <h3 className="text-2xl font-bold">{t("noCoding.title")}</h3>
                </div>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-[280px]">
                  {t("noCoding.description")}
                </p>
              </div>

              {/* Background Image */}
              <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-all duration-700 group-hover:scale-110">
                 <NextImage
                  src="/images/bento-nocode.webp"
                  alt="No Code Blocks"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 42vw"
                />
              </div>
            </motion.div>

            {/* Card 3: Instant Settlement (Bottom Right) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="relative group overflow-hidden rounded-[2.5rem] bg-[#0c0c0c] border border-white/5 p-8 flex flex-col justify-center"
            >
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                  {t("instant.title")}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed ml-2">
                  {t("instant.description")} <br />
                  <span className="text-blue-400">{t("instant.highlight")}</span>
                </p>
              </div>

               {/* Background Image */}
               <div className="absolute inset-0 z-0 opacity-50 mix-blend-screen group-hover:opacity-70 transition-all duration-700 group-hover:scale-105">
                <NextImage
                  src="/images/bento-instant.webp"
                  alt="Instant Settlement"
                  fill
                  className="object-cover object-center opacity-50 group-hover:opacity-70 transition-all duration-700"
                  sizes="(max-width: 768px) 100vw, 42vw"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-0" />
            </motion.div>

          </div>
        </div>
      </Container>
    </section>
  );
}
