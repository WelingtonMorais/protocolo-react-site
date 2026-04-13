import React from "react";
import { motion } from "framer-motion";
import BoltIcon from "@mui/icons-material/Bolt";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const items = [
  { icon: <BoltIcon sx={{ fontSize: 14, color: "#6034E1" }} />, text: "Tempo Real" },
  { icon: <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "#10B981" }} />, text: "Zero Extravios" },
  { icon: <StarOutlineIcon sx={{ fontSize: 14, color: "#F59E0B" }} />, text: "Fácil de Usar" },
  { icon: <BoltIcon sx={{ fontSize: 14, color: "#8B5CF6" }} />, text: "Notificações Imediatas" },
  { icon: <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "#6034E1" }} />, text: "100% Rastreado" },
  { icon: <StarOutlineIcon sx={{ fontSize: 14, color: "#10B981" }} />, text: "Condomínios de Todos os Tamanhos" },
  { icon: <BoltIcon sx={{ fontSize: 14, color: "#F59E0B" }} />, text: "QR Code Exclusivo" },
  { icon: <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "#EF4444" }} />, text: "Gestão Completa" },
];

const TickerRow: React.FC<{ dir?: "left" | "right" }> = ({ dir = "left" }) => {
  const doubled = [...items, ...items, ...items];
  return (
    <div style={{ overflow: "hidden", width: "100%", position: "relative" }}>
      <motion.div
        style={{
          display: "flex",
          gap: "clamp(24px, 4vw, 48px)",
          width: "max-content",
        }}
        animate={{ x: dir === "left" ? ["0%", "-33.33%"] : ["-33.33%", "0%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {item.icon}
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "clamp(0.7rem, 1vw, 0.82rem)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {item.text}
            </span>
            <span style={{ color: "rgba(96,52,225,0.35)", fontSize: "0.7rem" }}>✦</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export const LandingMarquee: React.FC = () => {
  return (
    <div
      style={{
        background: "#0D0A1A",
        borderTop: "1px solid rgba(96,52,225,0.12)",
        borderBottom: "1px solid rgba(96,52,225,0.12)",
        padding: "clamp(14px, 2vw, 20px) 0",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Edge fade masks */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0,
          width: "clamp(40px, 8vw, 120px)",
          background: "linear-gradient(to right, #0D0A1A, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: 0, top: 0, bottom: 0,
          width: "clamp(40px, 8vw, 120px)",
          background: "linear-gradient(to left, #0D0A1A, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <TickerRow dir="left" />
      <TickerRow dir="right" />
    </div>
  );
};
