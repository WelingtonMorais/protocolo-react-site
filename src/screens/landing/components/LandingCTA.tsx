import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BoltIcon from "@mui/icons-material/Bolt";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";

const EASE_SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_EXPO: [number, number, number, number] = [0.76, 0, 0.24, 1];

const badges = [
  { Icon: LockOutlinedIcon, text: "Dados Seguros", color: "#6034E1" },
  { Icon: BoltIcon, text: "Tempo Real", color: "#10B981" },
  { Icon: PhoneAndroidIcon, text: "Mobile Ready", color: "#8B5CF6" },
];

export const LandingCTA: React.FC = () => {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section
      ref={ref}
      id="para-condominios"
      style={{
        background: "#0D0A1A",
        padding: "clamp(60px, 10vw, 140px) clamp(20px, 5vw, 80px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated top border */}
      <motion.div
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent, #6034E1 35%, #10B981 65%, transparent)",
          transformOrigin: "left",
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: EASE_EXPO }}
      />

      {/* Parallax background */}
      <motion.div aria-hidden style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(96,52,225,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(96,52,225,0.035) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        pointerEvents: "none",
        y: bgY,
      }} />

      {/* Central glow */}
      <motion.div aria-hidden style={{
        position: "absolute",
        width: "70vw", height: "70vw",
        maxWidth: 800, maxHeight: 800,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(96,52,225,0.14) 0%, transparent 60%)",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        filter: "blur(100px)",
        pointerEvents: "none",
      }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating orbit rings */}
      {[200, 340, 500].map((size, i) => (
        <motion.div
          key={size}
          aria-hidden
          style={{
            position: "absolute",
            width: size, height: size,
            borderRadius: "50%",
            border: `1px solid rgba(96,52,225,${0.06 - i * 0.015})`,
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360, scale: [1, 1.04, 1] }}
          transition={{ duration: 20 + i * 8, repeat: Infinity, ease: "linear" }}
        />
      ))}

      <div style={{
        maxWidth: 780,
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
        textAlign: "center",
      }}>
        {/* Eyebrow */}
        <motion.div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: "clamp(16px, 2.5vw, 28px)",
            background: "rgba(96,52,225,0.1)",
            border: "1px solid rgba(96,52,225,0.2)",
            borderRadius: 100,
            padding: "6px 18px",
          }}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: EASE_SPRING }}
        >
          <motion.span
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#6034E1", display: "block" }}
            animate={{ scale: [1, 1.6, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 600,
            fontSize: "0.72rem", letterSpacing: "0.16em",
            textTransform: "uppercase", color: "#9B77F5",
          }}>
            Para Condomínios
          </span>
        </motion.div>

        {/* Headline */}
        <div style={{ overflow: "hidden" }}>
          <motion.h2
            style={{
              margin: 0,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2.5rem, 7vw, 6rem)",
              letterSpacing: "-0.048em",
              lineHeight: 0.88,
              color: "#ffffff",
            }}
            initial={{ y: "105%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : {}}
            transition={{ duration: 0.95, ease: EASE_SPRING, delay: 0.1 }}
          >
            Comece a usar
            <br />
            <span style={{
              background: "linear-gradient(135deg, #6034E1 30%, #10B981 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              hoje mesmo.
            </span>
          </motion.h2>
        </div>

        {/* Gradient line */}
        <motion.div
          style={{
            width: "min(70%, 380px)",
            height: 2,
            background: "linear-gradient(90deg, transparent, #6034E1 30%, #10B981 70%, transparent)",
            margin: "clamp(16px, 2.5vw, 28px) auto",
            borderRadius: 1,
            transformOrigin: "center",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={inView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 1.1, delay: 0.4, ease: EASE_SPRING }}
        />

        {/* Description */}
        <motion.p style={{
          margin: "0 auto",
          color: "rgba(255,255,255,0.46)",
          fontFamily: "'Inter', sans-serif",
          fontSize: "clamp(0.95rem, 1.6vw, 1.12rem)",
          lineHeight: 1.65,
          maxWidth: 460,
        }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE_SPRING, delay: 0.35 }}
        >
          Acesse a plataforma, cadastre seu condomínio e tenha controle total das encomendas dos seus moradores.
        </motion.p>

        {/* CTAs */}
        <motion.div
          style={{
            display: "flex",
            gap: "clamp(10px, 1.5vw, 16px)",
            marginTop: "clamp(28px, 4vw, 48px)",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE_SPRING, delay: 0.5 }}
        >
          <motion.button
            onClick={() => navigate("/login")}
            style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 700,
              fontSize: "0.9rem", letterSpacing: "0.04em",
              color: "#ffffff",
              background: "linear-gradient(135deg, #6034E1, #8B5CF6)",
              border: "1px solid rgba(96,52,225,0.5)",
              borderRadius: 10,
              padding: "15px 40px",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}
            whileHover={{ scale: 1.05, boxShadow: "0 14px 44px rgba(96,52,225,0.55)" }}
            whileTap={{ scale: 0.97 }}
          >
            Acessar Plataforma
            <ArrowForwardIcon sx={{ fontSize: 17 }} />
          </motion.button>

          <motion.button
            onClick={() => navigate("/cadastro")}
            style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 600,
              fontSize: "0.9rem", letterSpacing: "0.04em",
              color: "rgba(255,255,255,0.75)",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: "15px 40px",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", gap: 8,
            }}
            whileHover={{ background: "rgba(255,255,255,0.1)", color: "#ffffff" }}
            whileTap={{ scale: 0.97 }}
          >
            <PersonAddAltOutlinedIcon sx={{ fontSize: 17 }} />
            Criar Conta
          </motion.button>
        </motion.div>

        {/* Badge row */}
        <motion.div
          style={{
            display: "flex",
            gap: "clamp(12px, 3vw, 36px)",
            marginTop: "clamp(28px, 4vw, 52px)",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.72 }}
        >
          {badges.map((badge, i) => (
            <motion.div
              key={badge.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: `${badge.color}10`,
                border: `1px solid ${badge.color}25`,
                borderRadius: 100,
                padding: "8px 18px",
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, ease: EASE_SPRING, delay: 0.72 + i * 0.1 }}
              whileHover={{ scale: 1.06, background: `${badge.color}18` }}
            >
              <badge.Icon sx={{ fontSize: 15, color: badge.color }} />
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem", fontWeight: 600,
                letterSpacing: "0.08em",
                color: badge.color,
                textTransform: "uppercase",
              }}>
                {badge.text}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer strip */}
      <motion.div
        style={{
          borderTop: "1px solid rgba(96,52,225,0.1)",
          marginTop: "clamp(52px, 8vw, 96px)",
          paddingTop: "clamp(20px, 3vw, 32px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          position: "relative",
          zIndex: 1,
        }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.9 }}
      >
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.78rem",
          color: "rgba(255,255,255,0.18)",
          letterSpacing: "0.05em",
        }}>
          © {new Date().getFullYear()} Protocolo Encomendas
        </span>
        <div style={{ display: "flex", gap: "clamp(12px, 2vw, 24px)" }}>
          {["Entrar", "Cadastrar"].map((label) => (
            <button
              key={label}
              onClick={() => navigate(label === "Entrar" ? "/login" : "/cadastro")}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.78rem", fontWeight: 500,
                color: "rgba(255,255,255,0.28)",
                background: "none", border: "none",
                cursor: "pointer", letterSpacing: "0.05em", padding: 0,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
