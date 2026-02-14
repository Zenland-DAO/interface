"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export function SidebarBanner() {
  return (
    <div className="px-4 py-2">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 p-4 text-white shadow-lg group shadow-primary-500/10"
      >
        {/* Background Sparkles/Effect */}
        <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-20 transition-transform group-hover:scale-125 duration-700">
          <Sparkles className="w-16 h-16 text-white" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded-md bg-white/20">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
              Zenland Agent
            </span>
          </div>

          <h4 className="text-sm font-bold mb-1 leading-tight">
            Earn by resolving <br /> disputes.
          </h4>
          <p className="text-[10px] text-white/70 mb-3 leading-relaxed">
            Join the decentralized agent program and start earning fees.
          </p>

          <Link
            href="/agents"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold py-1.5 px-3 rounded-lg bg-white text-primary-700 hover:bg-primary-50 transition-colors shadow-sm"
          >
            Learn More
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Decorative subtle light */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </motion.div>
    </div>
  );
}
