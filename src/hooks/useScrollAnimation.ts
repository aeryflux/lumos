/**
 * useScrollAnimation - Hook for scroll-triggered animations
 *
 * Uses Intersection Observer to detect when elements enter the viewport
 * and applies animation classes. Inspired by OpenClaw's staggered fadeInUp pattern.
 *
 * Features:
 * - Respects prefers-reduced-motion
 * - Configurable threshold and rootMargin
 * - Supports staggered animations for child elements
 * - Once-only animation (doesn't repeat on re-enter)
 */

import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  /** Intersection threshold (0-1). Default 0.1 (10% visible) */
  threshold?: number;
  /** Root margin for early/late trigger. Default '-50px' */
  rootMargin?: string;
  /** Only animate once (don't reset when leaving viewport). Default true */
  once?: boolean;
  /** Delay in ms before starting animation. Default 0 */
  delay?: number;
}

interface UseScrollAnimationReturn {
  ref: React.RefObject<HTMLElement>;
  isVisible: boolean;
  hasAnimated: boolean;
}

/**
 * Hook that triggers animation when element scrolls into view
 */
export function useScrollAnimation(
  options: UseScrollAnimationOptions = {}
): UseScrollAnimationReturn {
  const { threshold = 0.1, rootMargin = '-50px', once = true, delay = 0 } = options;

  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // If reduced motion, mark as animated immediately
    if (prefersReducedMotion) {
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => {
                setIsVisible(true);
                setHasAnimated(true);
              }, delay);
            } else {
              setIsVisible(true);
              setHasAnimated(true);
            }

            // Unobserve if only animating once
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, delay]);

  return { ref: ref as React.RefObject<HTMLElement>, isVisible, hasAnimated };
}

/**
 * Hook that provides refs and visibility states for staggered animations
 */
export function useStaggeredAnimation(
  count: number,
  options: UseScrollAnimationOptions & { staggerDelay?: number } = {}
) {
  const { staggerDelay = 100, ...observerOptions } = options;
  const containerRef = useRef<HTMLElement>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(count).fill(false)
  );

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // If reduced motion, show all immediately
    if (prefersReducedMotion) {
      setVisibleItems(new Array(count).fill(true));
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger the visibility of each item
            for (let i = 0; i < count; i++) {
              setTimeout(() => {
                setVisibleItems((prev) => {
                  const next = [...prev];
                  next[i] = true;
                  return next;
                });
              }, i * staggerDelay);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: observerOptions.threshold ?? 0.1, rootMargin: observerOptions.rootMargin ?? '-50px' }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [count, staggerDelay, observerOptions.threshold, observerOptions.rootMargin]);

  return {
    containerRef: containerRef as React.RefObject<HTMLElement>,
    visibleItems,
    allVisible: visibleItems.every((v) => v),
  };
}

/**
 * CSS class helper for scroll animation
 * Returns appropriate classes based on visibility state
 */
export function getScrollAnimationClass(
  isVisible: boolean,
  baseClass: string = 'scroll-animate'
): string {
  return isVisible ? `${baseClass} ${baseClass}--visible` : baseClass;
}

export default useScrollAnimation;
