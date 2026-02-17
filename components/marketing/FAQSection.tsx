"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Heading, Text, Container } from "@/components/ui";
import { FAQ_ITEMS, type FAQItem } from "@/lib/constants/faq";
import { AnimateOnScroll } from "@/hooks";

/**
 * FAQ Accordion Item Component
 */
function FAQAccordionItem({ 
  item, 
  isOpen, 
  onToggle,
  index,
}: { 
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const t = useTranslations("marketing.faq.items");

  return (
    <div className="border-b border-[var(--border-secondary)] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full py-6 flex items-start justify-between gap-4 text-left cursor-pointer group"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
      >
        <span className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-primary-500 transition-colors pr-4">
          {t(`${item.key}.question`)}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-1"
        >
          <ChevronDown className="w-5 h-5 text-[var(--text-tertiary)]" />
        </motion.span>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6 pr-12">
              <Text className="text-[var(--text-secondary)] leading-relaxed">
                {t(`${item.key}.answer`)}
              </Text>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * FAQ Section Component
 * 
 * Displays frequently asked questions in an accordion format.
 * Uses FAQ_ITEMS from the shared config (DRY principle).
 * Translations are loaded from the locale files.
 */
export function FAQSection() {
  const t = useTranslations("marketing.faq");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 sm:py-24 lg:py-32 bg-[var(--bg-secondary)]/30">
      <Container>
        {/* Header */}
        <AnimateOnScroll animation="fade-up" className="text-center mb-12 lg:mb-16 max-w-2xl mx-auto">
          <Heading level={2} className="mb-6">
            {t("title")}
          </Heading>
          <Text variant="lead" className="text-[var(--text-secondary)]">
            {t("subtitle")}
          </Text>
        </AnimateOnScroll>

        {/* FAQ Accordion */}
        <AnimateOnScroll animation="fade-up" delay={100}>
          <div className="max-w-3xl mx-auto bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-secondary)] px-6 sm:px-8">
            {FAQ_ITEMS.map((item, index) => (
              <FAQAccordionItem
                key={item.key}
                item={item}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </div>
        </AnimateOnScroll>

        {/* Link to full docs */}
        <AnimateOnScroll animation="fade-up" delay={200} className="text-center mt-8">
          <Text className="text-[var(--text-tertiary)]">
            {t("moreQuestions")}{" "}
            <a 
              href="https://docs.zen.land/resources/faq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-500 hover:text-primary-600 underline underline-offset-2"
            >
              {t("viewDocs")}
            </a>
          </Text>
        </AnimateOnScroll>
      </Container>
    </section>
  );
}
