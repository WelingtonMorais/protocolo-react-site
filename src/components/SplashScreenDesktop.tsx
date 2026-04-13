import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import logoApp from "../../assets/logo_app.png";

const EASE_EXPO: [number, number, number, number] = [0.76, 0, 0.24, 1];
const EASE_SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];

const PANELS = 8;

const WORD_1 = "PROTO";
const WORD_2 = "COLO";

interface CharProps {
  char: string;
  delay: number;
  color?: string;
}

const BigChar: React.FC<CharProps> = ({ char, delay, color = "#ffffff" }) => (
  <div style={{ overflow: "hidden", display: "inline-block", verticalAlign: "bottom" }}>
    <motion.span
      style={{ display: "inline-block", color }}
      initial={{ y: "105%", opacity: 0 }}
      animate={{ y: "0%", opacity: 1 }}
      transition={{ duration: 0.9, ease: EASE_SPRING, delay }}
    >
      {char}
    </motion.span>
  </div>
);

export interface SplashScreenBaseProps {
  onComplete: () => void;
}

export const SplashScreenDesktop: React.FC<SplashScreenBaseProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<"logo" | "words" | "exiting">("logo");

  useEffect(() => {
    document.body.classList.add("splash-no-scroll");

    const t1 = setTimeout(() => setPhase("words"), 300);
    const t2 = setTimeout(() => setPhase("exiting"), 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.classList.remove("splash-no-scroll");
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* ── Main Splash Layer ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100dvh",
          zIndex: 999998,
          background: "#0D0A1A",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: phase === "exiting" ? 0 : 1,
          transition: "opacity 0.3s ease",
          transitionDelay: phase === "exiting" ? "0.45s" : "0s",
        }}
      >
        {/* Animated grid */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(96,52,225,0.055) 1px, transparent 1px),
              linear-gradient(90deg, rgba(96,52,225,0.055) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
            pointerEvents: "none",
          }}
        />

        {/* Glowing blob top-left */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            width: "45vw",
            height: "45vw",
            maxWidth: 520,
            maxHeight: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(96,52,225,0.2) 0%, transparent 70%)",
            top: "-15%",
            left: "-10%",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
          animate={{ x: [0, 30, -15, 0], y: [0, -25, 35, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Glowing blob bottom-right */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            width: "35vw",
            height: "35vw",
            maxWidth: 400,
            maxHeight: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.16) 0%, transparent 70%)",
            bottom: "-10%",
            right: "-10%",
            filter: "blur(70px)",
            pointerEvents: "none",
          }}
          animate={{ x: [0, -30, 20, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* ── Center content ── */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          {/* Logo */}
          <motion.div
            style={{
              position: "relative",
              marginBottom: "clamp(20px, 3vw, 40px)",
            }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE_SPRING }}
          >
            <motion.div
              style={{
                position: "absolute",
                inset: -20,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(96,52,225,0.35) 0%, transparent 70%)",
                filter: "blur(18px)",
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            />
            <img
              src={logoApp}
              alt="Protocolo"
              style={{
                display: "block",
                width: "clamp(56px, 7vw, 90px)",
                height: "clamp(56px, 7vw, 90px)",
                objectFit: "contain",
                borderRadius: "20%",
                position: "relative",
                zIndex: 1,
                filter: "drop-shadow(0 0 24px rgba(96,52,225,0.55))",
              }}
            />
          </motion.div>

          {/* Big title row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.12em",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(3.5rem, 11vw, 9rem)",
              letterSpacing: "-0.045em",
              lineHeight: 0.85,
              userSelect: "none",
            }}
          >
            {/* PROTO */}
            {WORD_1.split("").map((char, i) => (
              <BigChar
                key={`w1-${i}`}
                char={char}
                delay={0.55 + i * 0.07}
                color="#ffffff"
              />
            ))}

            {/* Separator squares (brand mark, like HHHusher) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.08em",
                margin: "0 0.15em",
                alignSelf: "center",
              }}
            >
              {[0, 1].map((j) => (
                <motion.div
                  key={j}
                  style={{
                    width: "clamp(10px, 1.2vw, 18px)",
                    height: "clamp(10px, 1.2vw, 18px)",
                    background:
                      j === 0
                        ? "linear-gradient(135deg, #6034E1, #8B5CF6)"
                        : "linear-gradient(135deg, #10B981, #34D399)",
                    borderRadius: "3px",
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.0 + j * 0.12, ease: EASE_SPRING }}
                />
              ))}
            </div>

            {/* COLO */}
            {WORD_2.split("").map((char, i) => (
              <BigChar
                key={`w2-${i}`}
                char={char}
                delay={0.75 + i * 0.07}
                color="#6034E1"
              />
            ))}
          </div>

          {/* Gradient line */}
          <motion.div
            style={{
              width: "min(88%, 560px)",
              height: 2,
              background:
                "linear-gradient(90deg, transparent 0%, #6034E1 30%, #10B981 70%, transparent 100%)",
              marginTop: "clamp(12px, 2vw, 20px)",
              borderRadius: 1,
              transformOrigin: "center",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 1.35, ease: EASE_SPRING }}
          />

          {/* Tagline */}
          <motion.p
            style={{
              margin: 0,
              marginTop: "clamp(10px, 1.5vw, 16px)",
              color: "rgba(255,255,255,0.38)",
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(0.6rem, 1.1vw, 0.875rem)",
              fontWeight: 500,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.65, ease: EASE_SPRING }}
          >
            Sistema de Encomendas
          </motion.p>
        </div>

        {/* Loading dots */}
        <div
          style={{
            position: "absolute",
            bottom: "max(24px, env(safe-area-inset-bottom, 0px))",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 8,
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
                background: i === 1 ? "#6034E1" : "rgba(96,52,225,0.35)",
              }}
              animate={{ scale: [1, 1.7, 1], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.18,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Exit panels (wipe top → bottom, like HHHusher) ── */}
      <AnimatePresence>
        {phase === "exiting" &&
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
                  zIndex: 999999,
                  background: i % 2 === 0 ? "#0D0A1A" : "#100D1F",
                  transformOrigin: "top",
                }}
                initial={{ scaleY: 1 }}
                animate={{ scaleY: 0 }}
                transition={{ duration: 0.7, delay: 0.5 + i * 0.07, ease: EASE_EXPO }}
                onAnimationComplete={isLast ? onComplete : undefined}
              />
            );
          })}
      </AnimatePresence>
    </>,
    document.body
  );
};
