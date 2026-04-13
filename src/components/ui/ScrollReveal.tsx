import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { Transition } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  variant?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale";
  className?: string;
  once?: boolean;
}

const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const SCROLL_TRANSITION = (delay: number): Transition => ({
  duration: 0.65,
  delay,
  ease: EASE,
});

/**
 * Montfort `data-animation="FadeIn"` equivalent.
 * Triggers when element enters the viewport.
 */
export const ScrollReveal = ({
  children,
  delay = 0,
  variant = "fadeUp",
  className,
  once = true,
}: ScrollRevealProps): React.JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[variant]}
      transition={SCROLL_TRANSITION(delay)}
    >
      {children}
    </motion.div>
  );
};

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

/**
 * Wraps children with stagger animation — like Montfort list reveals.
 */
export const StaggerContainer = ({
  children,
  staggerDelay = 0.08,
  className,
}: StaggerContainerProps): React.JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Individual stagger item — use inside StaggerContainer.
 */
export const StaggerItem = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
    }}
  >
    {children}
  </motion.div>
);

interface SplitTitleProps {
  text: string;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}

/**
 * Montfort `data-animation="Title"` — word-by-word reveal from below.
 */
export const SplitTitle = ({
  text,
  className,
  delay = 0,
  style,
}: SplitTitleProps): React.JSX.Element => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const words = text.split(" ");

  return (
    <span ref={ref} className={className} style={{ display: "block", ...style }}>
      {words.map((word, i) => (
        <span
          key={i}
          className="split-title-word"
        >
          <span
            className="split-title-inner"
            style={{
              animationDelay: isInView ? `${delay + i * 0.07}s` : "9999s",
              animationPlayState: isInView ? "running" : "paused",
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
};

/**
 * Montfort `data-animation="Line"` — horizontal line that draws from left.
 */
export const AnimatedLine = ({
  delay = 0,
  color = "rgba(96,52,225,0.3)",
}: {
  delay?: number;
  color?: string;
}): React.JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ scaleX: 0, transformOrigin: "left center" }}
      animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      style={{
        height: 1,
        background: color,
        transformOrigin: "left center",
        width: "100%",
      }}
    />
  );
};
