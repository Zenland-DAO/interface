"use client";

import { useState, useEffect, useRef } from "react";

interface UseCountUpOptions {
  /** Starting value */
  start?: number;
  /** End value to count to */
  end: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Decimal places */
  decimals?: number;
  /** Only start animation when visible */
  startOnView?: boolean;
  /** Prefix (e.g., "$") */
  prefix?: string;
  /** Suffix (e.g., "+") */
  suffix?: string;
  /** Format function for large numbers */
  formatter?: (value: number) => string;
}

/**
 * Hook for animated count-up effect.
 * Counts from a start value to an end value with easing.
 */
export function useCountUp({
  start = 0,
  end,
  duration = 2000,
  decimals = 0,
  startOnView = true,
  prefix = "",
  suffix = "",
  formatter,
}: UseCountUpOptions) {
  const [count, setCount] = useState(start);
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const elementRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);

  // Easing function for smooth animation
  const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4);
  };

  useEffect(() => {
    // Reset count when animation hasn't started or end is 0
    if (!hasStarted || end === 0) {
      return;
    }

    const startTime = performance.now();
    const startValue = start;
    const endValue = end;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setCount(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [hasStarted, start, end, duration]);

  // Intersection Observer for starting animation on view
  useEffect(() => {
    if (!startOnView || hasStarted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => observer.disconnect();
  }, [startOnView, hasStarted]);

  // Format the displayed value
  const formattedValue = () => {
    if (formatter) {
      return `${prefix}${formatter(count)}${suffix}`;
    }
    
    const fixed = count.toFixed(decimals);
    const formatted = decimals === 0 
      ? Number(fixed).toLocaleString()
      : Number(fixed).toLocaleString(undefined, { 
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals 
        });
    
    return `${prefix}${formatted}${suffix}`;
  };

  return {
    value: formattedValue(),
    ref: elementRef,
    hasStarted,
    rawValue: count,
  };
}
