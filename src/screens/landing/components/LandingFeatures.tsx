import React, { useRef, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, useSpring } from "framer-motion";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

const EASE_SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_EXPO: [number, number, number, number] = [0.76, 0, 0.24, 1];

/* ── Shared helpers ──────────────────────────────── */
const TextReveal: React.FC<{ children: React.ReactNode; delay?: number; style?: React.CSSProperties }> = ({
  children, delay = 0, style,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <div ref={ref} style={{ overflow: "hidden", ...style }}>
      <motion.div
        initial={{ y: "105%", opacity: 0 }}
        animate={inView ? { y: "0%", opacity: 1 } : {}}
        transition={{ duration: 0.9, ease: EASE_SPRING, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const FadeIn: React.FC<{
  children: React.ReactNode; delay?: number; style?: React.CSSProperties;
  direction?: "up" | "left" | "right" | "none";
}> = ({ children, delay = 0, style, direction = "up" }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const offsets = { up: { x: 0, y: 50 }, left: { x: -40, y: 0 }, right: { x: 40, y: 0 }, none: { x: 0, y: 0 } };
  return (
    <motion.div ref={ref} style={style}
      initial={{ opacity: 0, ...offsets[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.85, ease: EASE_SPRING, delay }}
    >
      {children}
    </motion.div>
  );
};

/* ── Tilt card ───────────────────────────────────── */
interface TiltCardProps {
  children: React.ReactNode;
  accent: string;
}
const TiltCard: React.FC<TiltCardProps> = ({ children, accent }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 });
  const glowX = useTransform(x, [-0.5, 0.5], ["20%", "80%"]);
  const glowY = useTransform(y, [-0.5, 0.5], ["20%", "80%"]);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        background: "#ffffff",
        borderRadius: 20,
        padding: "clamp(24px, 3vw, 36px)",
        border: "1px solid rgba(96,52,225,0.08)",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        transformStyle: "preserve-3d",
        perspective: 800,
        rotateX,
        rotateY,
      }}
      whileHover={{ boxShadow: `0 24px 60px ${accent}25, 0 8px 24px rgba(0,0,0,0.08)` }}
      transition={{ duration: 0.3 }}
    >
      {/* Moving glow spot on hover */}
      <motion.div
        style={{
          position: "absolute",
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
          left: glowX,
          top: glowY,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          filter: "blur(20px)",
        }}
      />

      {/* Top accent bar */}
      <motion.div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${accent}, transparent)`,
          borderRadius: "20px 20px 0 0",
          opacity: 0.8,
          transformOrigin: "left",
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE_EXPO }}
      />

      {children}
    </motion.div>
  );
};

/* ── Icon box ────────────────────────────────────── */
const IconBox: React.FC<{ Icon: SvgIconComponent; accent: string; delay: number }> = ({ Icon, accent, delay }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: `linear-gradient(135deg, ${accent}18, ${accent}08)`,
        border: `1px solid ${accent}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        position: "relative",
        overflow: "hidden",
      }}
      initial={{ scale: 0.4, opacity: 0, rotate: -15 }}
      animate={inView ? { scale: 1, opacity: 1, rotate: 0 } : {}}
      transition={{ duration: 0.6, ease: EASE_SPRING, delay }}
    >
      {/* Pulse ring */}
      <motion.div
        style={{
          position: "absolute",
          inset: -4,
          borderRadius: 18,
          border: `1.5px solid ${accent}50`,
        }}
        animate={hovered ? { scale: 1.18, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <Icon sx={{ fontSize: 24, color: accent }} />
    </motion.div>
  );
};

/* ── Data ────────────────────────────────────────── */
const features: { Icon: SvgIconComponent; title: string; description: string; accent: string }[] = [
  {
    Icon: Inventory2OutlinedIcon,
    title: "Registro Rápido",
    description: "O operador registra a encomenda em segundos. QR Code gerado automaticamente para rastreamento completo.",
    accent: "#6034E1",
  },
  {
    Icon: NotificationsActiveOutlinedIcon,
    title: "Notificação Instantânea",
    description: "O morador recebe aviso imediato no smartphone assim que a encomenda chega ao condomínio.",
    accent: "#10B981",
  },
  {
    Icon: QrCode2Icon,
    title: "Retirada com QR Code",
    description: "Código QR exclusivo por encomenda. Confirmação de retirada rápida, digital e sem papel.",
    accent: "#8B5CF6",
  },
  {
    Icon: QueryStatsIcon,
    title: "Histórico Completo",
    description: "Relatórios detalhados de todas as movimentações. Rastreie qualquer encomenda a qualquer momento.",
    accent: "#F59E0B",
  },
  {
    Icon: PeopleAltOutlinedIcon,
    title: "Gestão de Moradores",
    description: "Cadastro completo por unidade. Controle de acesso e permissões de forma simples e intuitiva.",
    accent: "#EF4444",
  },
  {
    Icon: ShieldOutlinedIcon,
    title: "Seguro e Confiável",
    description: "Autenticação segura, dados criptografados. Sua operação protegida 24 horas por dia.",
    accent: "#6034E1",
  },
];

/* ── Section ─────────────────────────────────────── */
export const LandingFeatures: React.FC = () => {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-80px" });

  return (
    <section
      id="funcionalidades"
      style={{
        background: "#F7F5FF",
        padding: "clamp(60px, 10vw, 130px) clamp(20px, 5vw, 80px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated gradient top border */}
      <motion.div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent 0%, #6034E1 40%, #10B981 60%, transparent 100%)",
          transformOrigin: "left",
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: EASE_EXPO }}
      />

      {/* Background decorative circles */}
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          width: 500, height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(96,52,225,0.04) 0%, transparent 70%)",
          top: "-10%", right: "-8%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          width: 350, height: 350,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)",
          bottom: "5%", left: "-5%",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Section header */}
        <div ref={titleRef} style={{ marginBottom: "clamp(48px, 7vw, 80px)" }}>
          <motion.div
            style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}
            initial={{ opacity: 0, x: -24 }}
            animate={titleInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE_SPRING }}
          >
            <motion.span
              style={{ display: "block", height: 1, background: "#6034E1", width: 0 }}
              animate={titleInView ? { width: 28 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE_EXPO }}
            />
            <span style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 600,
              fontSize: "0.72rem", letterSpacing: "0.2em",
              textTransform: "uppercase", color: "#6034E1",
            }}>
              Funcionalidades
            </span>
          </motion.div>

          <TextReveal delay={0.1}>
            <h2 style={{
              margin: 0, fontFamily: "'Inter', sans-serif",
              fontWeight: 800, fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
              letterSpacing: "-0.04em", lineHeight: 0.95, color: "#1A1033",
            }}>
              Tudo que você precisa
              <br />
              <span style={{ color: "#6034E1" }}>em um só lugar.</span>
            </h2>
          </TextReveal>

          <FadeIn delay={0.2}>
            <p style={{
              margin: "clamp(16px, 2vw, 24px) 0 0", color: "#6B7280",
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)",
              lineHeight: 1.6, maxWidth: 520,
            }}>
              Do registro à retirada, a plataforma cobre cada etapa do processo de encomendas do seu condomínio.
            </p>
          </FadeIn>
        </div>

        {/* Features grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
          gap: "clamp(16px, 2.5vw, 28px)",
        }}>
          {features.map((feat, i) => (
            <FadeIn key={feat.title} delay={0.07 * i} direction="up">
              <TiltCard accent={feat.accent}>
                <IconBox Icon={feat.Icon} accent={feat.accent} delay={0.07 * i + 0.15} />

                <motion.h3
                  style={{
                    margin: "0 0 10px",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
                    letterSpacing: "-0.02em",
                    color: "#1A1033",
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: EASE_SPRING, delay: 0.07 * i + 0.22 }}
                >
                  {feat.title}
                </motion.h3>

                <motion.p
                  style={{
                    margin: 0, color: "#6B7280",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "clamp(0.875rem, 1.1vw, 0.95rem)",
                    lineHeight: 1.65,
                  }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: EASE_SPRING, delay: 0.07 * i + 0.3 }}
                >
                  {feat.description}
                </motion.p>
              </TiltCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
