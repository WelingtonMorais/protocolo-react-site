import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  animate,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const EASE_SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ── Animated counter ─────────────────────────────── */
const Counter: React.FC<{
  target: number;
  suffix?: string;
  prefix?: string;
}> = ({ target, suffix = "", prefix = "" }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const ctrl = animate(0, target, {
            duration: 1.8,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => setDisplay(Math.round(v)),
          });
          return () => ctrl.stop();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
};

/* ── Word reveal ──────────────────────────────────── */
const WordReveal: React.FC<{
  text: string;
  delay?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, color = "#ffffff", style }) => (
  <div style={{ overflow: "hidden", display: "inline-block", ...style }}>
    <motion.span
      style={{ display: "inline-block", color }}
      initial={{ y: "105%", opacity: 0 }}
      animate={{ y: "0%", opacity: 1 }}
      transition={{ duration: 1, ease: EASE_SPRING, delay }}
    >
      {text}
    </motion.span>
  </div>
);

/* ── Floating geometry ────────────────────────────── */
const FloatShape: React.FC<{
  size: number;
  x: string;
  y: string;
  color: string;
  delay?: number;
  shape?: "square" | "circle" | "ring";
}> = ({ size, x, y, color, delay = 0, shape = "circle" }) => (
  <motion.div
    aria-hidden
    style={{
      position: "absolute",
      width: size,
      height: size,
      left: x,
      top: y,
      borderRadius: shape === "square" ? 6 : "50%",
      background: shape === "ring" ? "transparent" : `${color}22`,
      border: shape === "ring" ? `1.5px solid ${color}44` : "none",
      pointerEvents: "none",
      zIndex: 1,
    }}
    animate={{
      y: [-12, 12, -12],
      x: [-6, 6, -6],
      rotate: shape === "square" ? [0, 20, 0] : [0, 360],
    }}
    transition={{
      duration: shape === "square" ? 7 : 14,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
  />
);

export const LandingHero: React.FC = () => {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.94]);

  const blobX = useTransform(springX, [-200, 200], ["-3%", "3%"]);
  const blobY = useTransform(springY, [-200, 200], ["-3%", "3%"]);
  const blobX2 = useTransform(springX, [-200, 200], ["3%", "-3%"]);
  const blobY2 = useTransform(springY, [-200, 200], ["3%", "-3%"]);

  const onMouseMove = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mouseX.set(e.clientX - r.left - r.width / 2);
    mouseY.set(e.clientY - r.top - r.height / 2);
  };

  const stats = [
    { value: 30, suffix: "s", label: "Para registrar" },
    { value: 100, suffix: "%", label: "Rastreado" },
    { value: 0, suffix: "", prefix: "", label: "Extravios" },
  ];

  return (
    <section
      ref={ref}
      id="hero"
      onMouseMove={onMouseMove}
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",
        minHeight: 600,
        overflow: "hidden",
        background: "#0D0A1A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Parallax BG layer */}
      <motion.div style={{ position: "absolute", inset: 0, y: bgY }}>
        {/* Grid */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
            linear-gradient(rgba(96,52,225,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(96,52,225,0.055) 1px, transparent 1px)
          `,
            backgroundSize: "44px 44px",
          }}
        />

        {/* Blob 1 — mouse parallax */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            width: "65vw",
            height: "65vw",
            maxWidth: 780,
            maxHeight: 780,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(96,52,225,0.2) 0%, transparent 65%)",
            top: "-20%",
            left: "-12%",
            filter: "blur(100px)",
            x: blobX,
            y: blobY,
          }}
        />

        {/* Blob 2 */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            width: "50vw",
            height: "50vw",
            maxWidth: 620,
            maxHeight: 620,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.13) 0%, transparent 65%)",
            bottom: "-15%",
            right: "-12%",
            filter: "blur(90px)",
            x: blobX2,
            y: blobY2,
          }}
        />

        {/* Blob 3 accent — small & sharp */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            width: "20vw",
            height: "20vw",
            maxWidth: 260,
            maxHeight: 260,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 65%)",
            top: "30%",
            right: "25%",
            filter: "blur(50px)",
          }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        />
      </motion.div>

      {/* Floating shapes */}
      <FloatShape
        size={32}
        x="8%"
        y="20%"
        color="#6034E1"
        shape="square"
        delay={0}
      />
      <FloatShape
        size={18}
        x="88%"
        y="15%"
        color="#10B981"
        shape="circle"
        delay={1.5}
      />
      <FloatShape
        size={52}
        x="82%"
        y="55%"
        color="#8B5CF6"
        shape="ring"
        delay={0.8}
      />
      <FloatShape
        size={14}
        x="15%"
        y="72%"
        color="#10B981"
        shape="square"
        delay={2.5}
      />
      <FloatShape
        size={64}
        x="5%"
        y="45%"
        color="#6034E1"
        shape="ring"
        delay={0.3}
      />
      <FloatShape
        size={22}
        x="70%"
        y="80%"
        color="#F59E0B"
        shape="circle"
        delay={3}
      />
      <FloatShape
        size={10}
        x="45%"
        y="12%"
        color="#EF4444"
        shape="circle"
        delay={1}
      />

      {/* Content */}
      <motion.div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "0 clamp(20px, 5vw, 80px)",
          maxWidth: 1100,
          y: contentY,
          opacity,
          scale,
        }}
      >
        {/* Eyebrow pill */}
        <motion.div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: "clamp(40px, 7vw, 72px)",
            background: "rgba(96,52,225,0.12)",
            border: "1px solid rgba(96,52,225,0.25)",
            borderRadius: 100,
            padding: "6px 16px",
          }}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE_SPRING }}
        >
          <motion.span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#6034E1",
              display: "block",
            }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: "0.72rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#9B77F5",
            }}
          >
            Sistema de Controle de Encomendas
          </span>
        </motion.div>

        {/* Main headline */}
        <h1
          style={{
            margin: 0,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(2.8rem, 9vw, 8.5rem)",
            letterSpacing: "-0.05em",
            lineHeight: 0.87,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.06em",
          }}
        >
          <WordReveal text="Nenhuma" delay={0.35} color="#ffffff" />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.22em",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <WordReveal text="Encomenda" delay={0.5} color="#6034E1" />
            <WordReveal text="Perdida." delay={0.7} color="#ffffff" />
          </div>
        </h1>

        {/* Gradient line — draws itself */}
        <motion.div
          style={{
            width: "min(80%, 420px)",
            height: 2,
            background:
              "linear-gradient(90deg, transparent, #6034E1 30%, #10B981 70%, transparent)",
            margin: "clamp(20px, 3vw, 32px) auto 0",
            borderRadius: 1,
            transformOrigin: "left",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.1, delay: 1.0, ease: EASE_SPRING }}
        />

        {/* Subheadline */}
        <motion.p
          style={{
            margin: "clamp(16px, 2.5vw, 24px) 0 0",
            color: "rgba(255,255,255,0.52)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.95rem, 1.8vw, 1.22rem)",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            lineHeight: 1.58,
            maxWidth: 520,
          }}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.15, ease: EASE_SPRING }}
        >
          Registre, notifique e rastreie cada encomenda do condomínio — do
          porteiro ao morador — em segundos.
        </motion.p>

        {/* CTAs */}
        <motion.div
          style={{
            display: "flex",
            gap: "clamp(10px, 1.5vw, 16px)",
            marginTop: "clamp(28px, 4vw, 44px)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4, ease: EASE_SPRING }}
        >
          <motion.button
            onClick={() => navigate("/login")}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "0.88rem",
              letterSpacing: "0.04em",
              color: "#ffffff",
              background: "linear-gradient(135deg, #6034E1, #8B5CF6)",
              border: "1px solid rgba(96,52,225,0.5)",
              borderRadius: 10,
              padding: "14px 36px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 36px rgba(96,52,225,0.5)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            Acessar Plataforma
            <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </motion.button>

          <motion.button
            onClick={() =>
              document
                .getElementById("funcionalidades")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: "0.88rem",
              letterSpacing: "0.04em",
              color: "rgba(255,255,255,0.78)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.13)",
              borderRadius: 10,
              padding: "14px 36px",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
            }}
            whileHover={{
              background: "rgba(255,255,255,0.1)",
              color: "#ffffff",
            }}
            whileTap={{ scale: 0.97 }}
          >
            Ver Funcionalidades
          </motion.button>
        </motion.div>

        {/* Animated stats row */}
        <motion.div
          style={{
            display: "flex",
            gap: "clamp(20px, 4vw, 56px)",
            marginTop: "clamp(36px, 5vw, 60px)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)",
                  letterSpacing: "-0.04em",
                  color: "#ffffff",
                  lineHeight: 1,
                }}
              >
                {s.prefix}
                <Counter target={s.value} suffix={s.suffix} prefix={s.prefix} />
                {s.suffix === "s" && (
                  <span
                    style={{
                      fontSize: "0.55em",
                      color: "rgba(255,255,255,0.4)",
                      marginLeft: 2,
                    }}
                  >
                    seg
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)",
                  marginTop: 5,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{
          position: "absolute",
          bottom: "clamp(20px, 3vw, 36px)",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          zIndex: 2,
          opacity,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <KeyboardArrowDownIcon
            sx={{ fontSize: 22, color: "rgba(255,255,255,0.25)" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};
