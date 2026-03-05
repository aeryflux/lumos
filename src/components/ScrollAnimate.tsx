/**
 * ScrollAnimate - Component for scroll-triggered animations
 *
 * Wraps content and animates it when it scrolls into view.
 * Uses Intersection Observer with reduced motion support.
 *
 * Usage:
 * <ScrollAnimate>
 *   <YourContent />
 * </ScrollAnimate>
 *
 * With variant:
 * <ScrollAnimate variant="scale">
 *   <YourContent />
 * </ScrollAnimate>
 */

import { useEffect, useRef, useState, type ReactNode, type JSX } from 'react';

type AnimationVariant = 'default' | 'fade' | 'scale' | 'left' | 'right';

interface ScrollAnimateProps {
  children: ReactNode;
  /** Animation variant. Default 'default' (slide up) */
  variant?: AnimationVariant;
  /** Intersection threshold (0-1). Default 0.1 */
  threshold?: number;
  /** Root margin for trigger timing. Default '-50px' */
  rootMargin?: string;
  /** Stagger index for delayed animation (1-6) */
  stagger?: number;
  /** Additional className */
  className?: string;
  /** HTML tag to use. Default 'div' */
  as?: keyof JSX.IntrinsicElements;
}

export function ScrollAnimate({
  children,
  variant = 'default',
  threshold = 0.1,
  rootMargin = '-50px',
  stagger,
  className = '',
  as: Tag = 'div',
}: ScrollAnimateProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // If reduced motion, show immediately
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  const variantClass = variant !== 'default' ? `scroll-animate--${variant}` : '';
  const visibleClass = isVisible ? 'scroll-animate--visible' : '';
  const classes = `scroll-animate ${variantClass} ${visibleClass} ${className}`.trim();

  // Using type assertion for the dynamic tag
  const Component = Tag as 'div';

  return (
    <Component
      ref={ref as React.RefObject<HTMLDivElement>}
      className={classes}
      data-stagger={stagger}
    >
      {children}
    </Component>
  );
}

/**
 * ScrollAnimateGroup - Animate multiple children with stagger
 *
 * Usage:
 * <ScrollAnimateGroup>
 *   <Card />
 *   <Card />
 *   <Card />
 * </ScrollAnimateGroup>
 */

interface ScrollAnimateGroupProps {
  children: ReactNode[];
  /** Animation variant for all children */
  variant?: AnimationVariant;
  /** Delay between each child animation in ms. Default 100 */
  staggerDelay?: number;
  /** Intersection threshold (0-1). Default 0.1 */
  threshold?: number;
  /** Root margin for trigger timing. Default '-50px' */
  rootMargin?: string;
  /** Additional className for container */
  className?: string;
  /** Additional className for each item */
  itemClassName?: string;
  /** HTML tag for container. Default 'div' */
  as?: keyof JSX.IntrinsicElements;
}

export function ScrollAnimateGroup({
  children,
  variant = 'default',
  staggerDelay = 100,
  threshold = 0.1,
  rootMargin = '-50px',
  className = '',
  itemClassName = '',
  as: Tag = 'div',
}: ScrollAnimateGroupProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(children.length).fill(false)
  );

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // If reduced motion, show all immediately
    if (prefersReducedMotion) {
      setVisibleItems(new Array(children.length).fill(true));
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger the visibility of each item
            children.forEach((_, i) => {
              setTimeout(() => {
                setVisibleItems((prev) => {
                  const next = [...prev];
                  next[i] = true;
                  return next;
                });
              }, i * staggerDelay);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [children.length, staggerDelay, threshold, rootMargin]);

  const variantClass = variant !== 'default' ? `scroll-animate--${variant}` : '';
  const Component = Tag as 'div';

  return (
    <Component ref={containerRef as React.RefObject<HTMLDivElement>} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`scroll-animate ${variantClass} ${visibleItems[index] ? 'scroll-animate--visible' : ''} ${itemClassName}`.trim()}
        >
          {child}
        </div>
      ))}
    </Component>
  );
}

export default ScrollAnimate;
