import React, { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logoApp from "../../../../assets/logo_app.png";

export const LandingHeader: React.FC = () => {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = lastY.current;
    setScrolled(latest > 40);

    if (latest > prev && latest > 80) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    lastY.current = latest;
  });

  return (
    <motion.header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 clamp(20px, 3vw, 48px)",
      }}
      animate={{ y: hidden ? "-110%" : "0%" }}
      transition={{ duration: 0.45, ease: [0.32, 0.94, 0.6, 1] }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: scrolled ? "12px 0" : "20px 0",
          transition: "padding 0.4s ease",
          position: "relative",
        }}
      >
        {/* Backdrop */}
        <div
          style={{
            position: "absolute",
            inset: "-8px -20px",
            borderRadius: 12,
            backdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
            background: scrolled ? "rgba(13,10,26,0.75)" : "transparent",
            transition: "all 0.4s cubic-bezier(0.32,0.94,0.6,1)",
            zIndex: -1,
            border: scrolled ? "1px solid rgba(96,52,225,0.15)" : "none",
          }}
        />

        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <img
            src={logoApp}
            alt="Protocolo"
            style={{
              width: 36,
              height: 36,
              objectFit: "contain",
              borderRadius: "25%",
              filter: "drop-shadow(0 0 10px rgba(96,52,225,0.5))",
            }}
          />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 800,
              fontSize: "1.05rem",
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            PROTOCOLO
          </span>
        </button>

        {/* Nav links (desktop) */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(16px, 2.5vw, 36px)",
          }}
          className="landing-nav-desktop"
        >
          {["Funcionalidades", "Como Funciona", "Para Condomínios"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: "0.82rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                transition: "color 0.3s ease",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA button */}
        <motion.button
          onClick={() => navigate("/login")}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "0.78rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#ffffff",
            background: "linear-gradient(135deg, #6034E1 0%, #8B5CF6 100%)",
            border: "1px solid rgba(96,52,225,0.4)",
            borderRadius: 8,
            padding: "9px 22px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          whileHover={{
            scale: 1.04,
            background: "linear-gradient(135deg, #7344F2 0%, #9D6EFF 100%)",
          }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2 }}
        >
          Entrar
        </motion.button>
      </div>
    </motion.header>
  );
};
