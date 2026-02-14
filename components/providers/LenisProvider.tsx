"use client";

import { useEffect, useRef, ReactNode } from "react";
import Lenis from "@studio-freight/lenis";

/**
 * LenisProvider - Enables smooth momentum scrolling
 *
 * Wraps the app to provide inertial/kinetic scrolling similar to
 * high-end SaaS landing pages.
 *
 * Based on Lenis by Studio Freight - industry standard for smooth scrolling.
 */

interface LenisProviderProps {
  children: ReactNode;
}

export function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Check if device is touch-enabled or has a small screen (mobile ratio)
    // We use a more robust check for mobile/touch
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isMobileRatio = window.innerWidth < 1024;

    if (isTouchDevice || isMobileRatio) {
      document.documentElement.classList.remove("lenis-active");
      return;
    }

    // Add class to HTML for CSS targeting
    document.documentElement.classList.add("lenis-active");

    // Initialize Lenis with refined momentum settings for desktop
    lenisRef.current = new Lenis({
      duration: 1.0,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.1,
    });

    // Animation frame loop - only runs if lenis is initialized
    let rafId: number;
    function raf(time: number) {
      lenisRef.current?.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenisRef.current?.destroy();
      cancelAnimationFrame(rafId);
      document.documentElement.classList.remove("lenis-active");
    };
  }, []);

  return <>{children}</>;
}
