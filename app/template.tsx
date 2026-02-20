"use client";

import { motion } from "framer-motion";

/**
 * Page transition template.
 * Uses opacity-only animation to reduce GPU pressure on Safari iOS.
 * Scale + translate transforms force full-page compositing which is
 * expensive on Safari's weaker GPU pipeline.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
