import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import logoApp from "../../assets/logo_app.png";

const EASE_EXPO: [number, number, number, number] = [0.76, 0, 0.24, 1];
const EASE_SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface CharRevealProps {
  text: string;
  startDelay: number;
  color?: string;
}

const CharReveal: React.FC<CharRevealProps> = ({ text, startDelay, color = "#ffffff" }) => (
  <>
    {text.split("").map((char, i) => (
      <span
        key={i}
        style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
      >
        <motion.span
          style={{ display: "inline-block", color }}
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE_SPRING, delay: startDelay + i * 0.06 }}
        >
          {char}
        </motion.span>
      </span>
    ))}
  </>
);

export interface SplashScreenBaseProps {
  onComplete: () => void;
}

const PANELS = 8;

export const SplashScreenDesktop: React.FC<SplashScreenBaseProps> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    document.body.classList.add("splash-no-scroll");
    const t = setTimeout(() => setIsExiting(true), 2600);
    return () => {
      clearTimeout(t);
      document.body.classList.remove("splash-no-scroll");
    };
  }, []);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          minHeight: "100dvh",
          height: "100%",
          zIndex: 999998,
          background: "#0D0A1A",
          overflow: "hidden",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: "max(16px, env(safe-area-inset-left, 0px))",
          paddingRight: "max(16px, env(safe-area-inset-right, 0px))",
          paddingTop: "max(12px, env(safe-area-inset-top, 0px))",
          paddingBottom: "max(48px, env(safe-area-inset-bottom, 0px))",
          opacity: isExiting ? 0 : 1,
          transition: "opacity 0.25s ease",
          transitionDelay: isExiting ? "0.4s" : "0s",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(96,52,225,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(96,52,225,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />

        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            width: "min(50vw, 400px)",
            height: "min(50vw, 400px)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(96,52,225,0.22) 0%, transparent 70%)",
            top: "-8%",
            left: "-8%",
            filter: "blur(56px)",
            pointerEvents: "none",
          }}
          animate={{ x: [0, 24, -12, 0], y: [0, -20, 32, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            width: "min(36vw, 300px)",
            height: "min(36vw, 300px)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%)",
            bottom: "2%",
            right: "-8%",
            filter: "blur(48px)",
            pointerEvents: "none",
          }}
          animate={{ x: [0, -24, 16, 0], y: [0, 28, -16, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: 520,
            flexShrink: 0,
          }}
        >
          <div style={{ position: "relative", marginBottom: "clamp(16px, 4vw, 28px)" }}>
            <motion.div
              style={{
                position: "absolute",
                top: -14,
                left: -14,
                right: -14,
                bottom: -14,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(96,52,225,0.28) 0%, transparent 70%)",
                filter: "blur(16px)",
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.img
              src={logoApp}
              alt="Protocolo"
              style={{
                display: "block",
                width: "clamp(72px, 18vw, 110px)",
                height: "clamp(72px, 18vw, 110px)",
                objectFit: "contain",
                position: "relative",
                zIndex: 1,
                borderRadius: "18%",
                filter: "drop-shadow(0 0 20px rgba(96,52,225,0.5))",
              }}
              initial={{ scale: 0.5, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: EASE_SPRING }}
            />
          </div>

          <div
            style={{
              fontSize: "clamp(1.35rem, 5.8vw, 4.5rem)",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.15em",
              width: "100%",
              textAlign: "center",
            }}
          >
            <CharReveal text="PROTO" startDelay={0.85} color="#ffffff" />

            <div style={{ overflow: "hidden", display: "flex", alignItems: "center" }}>
              <motion.div
                style={{
                  width: "0.05em",
                  height: "0.7em",
                  background: "linear-gradient(180deg, #6034E1 0%, #10B981 100%)",
                  borderRadius: "2px",
                }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.3, ease: EASE_SPRING }}
              />
            </div>

            <CharReveal text="COLO" startDelay={1.05} color="#6034E1" />
          </div>

          <motion.div
            style={{
              height: 2,
              width: "min(85%, 280px)",
              background:
                "linear-gradient(90deg, transparent 0%, #6034E1 30%, #10B981 70%, transparent 100%)",
              marginTop: "clamp(10px, 2.5vw, 18px)",
              borderRadius: 1,
              transformOrigin: "center",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.55, ease: EASE_SPRING }}
          />

          <motion.p
            style={{
              margin: 0,
              marginTop: "clamp(10px, 2.5vw, 16px)",
              color: "rgba(255,255,255,0.42)",
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(0.65rem, 2.8vw, 0.875rem)",
              fontWeight: 400,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textAlign: "center",
              lineHeight: 1.35,
              maxWidth: "100%",
              padding: "0 4px",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.9, ease: EASE_SPRING }}
          >
            Sistema de Encomendas
          </motion.p>
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "max(16px, env(safe-area-inset-bottom, 0px))",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 7,
            pointerEvents: "none",
          }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: i === 1 ? "#6034E1" : "rgba(96,52,225,0.4)",
              }}
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>

      {isExiting &&
        Array.from({ length: PANELS }).map((_, i) => {
          const isLast = i === PANELS - 1;
          return (
            <motion.div
              key={`panel-${i}`}
              style={{
                position: "fixed",
                top: 0,
                left: `${(i / PANELS) * 100}%`,
                width: `${100 / PANELS + 0.2}%`,
                height: "100dvh",
                minHeight: "100%",
                zIndex: 999999,
                background: i % 2 === 0 ? "#0D0A1A" : "#100D1F",
                transformOrigin: "top",
              }}
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0 }}
              transition={{ duration: 0.65, delay: i * 0.065, ease: EASE_EXPO }}
              onAnimationComplete={isLast ? onComplete : undefined}
            />
          );
        })}
    </>,
    document.body
  );
};
