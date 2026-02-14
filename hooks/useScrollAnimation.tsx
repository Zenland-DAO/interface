"use client";

import { useEffect, useRef, useState, RefObject } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook to trigger animations when element enters viewport
 *
 * @example
 * const { ref, isVisible } = useScrollAnimation();
 * <div ref={ref} className={isVisible ? "fade-up" : "opacity-0"}>
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
): { ref: RefObject<T | null>; isVisible: boolean } {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

/**
 * Component wrapper for scroll-triggered animations
 */
interface AnimateOnScrollProps {
  children: React.ReactNode;
  animation?: "fade-up" | "scale-in" | "slide-in-left" | "slide-in-right";
  delay?: number;
  className?: string;
}

export function AnimateOnScroll({
  children,
  animation = "fade-up",
  delay = 0,
  className = "",
}: AnimateOnScrollProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`
        ${isVisible ? animation : "opacity-0 translate-y-5"}
        transition-all duration-600 ease-out
        ${className}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
