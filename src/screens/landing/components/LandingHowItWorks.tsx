import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

const EASE_SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_EXPO: [number, number, number, number] = [0.76, 0, 0.24, 1];

const steps: {
  number: string; title: string; description: string;
  detail: string; color: string; Icon: SvgIconComponent;
}[] = [
  {
    number: "01",
    title: "Encomenda Chega",
    description: "O porteiro ou operador recebe a encomenda no condomínio e abre o app Protocolo.",
    detail: "Processo de registro: menos de 30 segundos",
    color: "#6034E1",
    Icon: LocalShippingOutlinedIcon,
  },
  {
    number: "02",
    title: "Registro & QR Code",
    description: "Fotografa a encomenda, informa a unidade de destino e o sistema gera um QR Code único.",
    detail: "Foto + unidade + código gerado automaticamente",
    color: "#8B5CF6",
    Icon: QrCode2Icon,
  },
  {
    number: "03",
    title: "Notificação ao Morador",
    description: "O morador recebe imediatamente uma notificação com os dados e instruções de retirada.",
    detail: "Push notification em tempo real",
    color: "#10B981",
    Icon: NotificationsActiveOutlinedIcon,
  },
  {
    number: "04",
    title: "Retirada Confirmada",
    description: "Na retirada, o morador apresenta o QR Code. O operador escaneia e registra a entrega.",
    detail: "Histórico registrado e auditável",
    color: "#34D399",
    Icon: CheckCircleOutlinedIcon,
  },
];

/* ── Step card ───────────────────────────────────── */
const Step: React.FC<{ step: typeof steps[0]; index: number; isLast: boolean }> = ({
  step, index, isLast,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "clamp(20px, 3vw, 40px)", position: "relative" }}>
      {/* Left: icon + line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Icon ring */}
        <motion.div
          style={{
            width: "clamp(56px, 6vw, 70px)",
            height: "clamp(56px, 6vw, 70px)",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${step.color}25, ${step.color}08)`,
            border: `1.5px solid ${step.color}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
          }}
          initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
          animate={inView ? { scale: 1, opacity: 1, rotate: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE_SPRING, delay: index * 0.1 }}
        >
          {/* Outer pulse ring */}
          <motion.div
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: `1px solid ${step.color}33`,
            }}
            animate={inView ? { scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] } : {}}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.25 }}
          />

          <step.Icon sx={{ fontSize: "clamp(22px, 2.5vw, 28px)", color: step.color }} />
        </motion.div>

        {/* Connecting line */}
        {!isLast && (
          <div style={{ flex: 1, width: 1.5, margin: "8px 0", position: "relative", overflow: "hidden" }}>
            <motion.div
              style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: `linear-gradient(to bottom, ${step.color}88, ${steps[index + 1]?.color ?? step.color}33)`,
                transformOrigin: "top",
              }}
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.9, ease: EASE_EXPO, delay: index * 0.1 + 0.35 }}
            />
          </div>
        )}
      </div>

      {/* Right: content */}
      <div style={{ paddingBottom: isLast ? 0 : "clamp(40px, 6vw, 68px)" }}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.75, ease: EASE_SPRING, delay: index * 0.1 + 0.12 }}
        >
          {/* Step number */}
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "0.68rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: `${step.color}99`,
          }}>
            Etapa {step.number}
          </span>

          <h3 style={{
            margin: "6px 0 10px",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
            letterSpacing: "-0.025em",
            color: "#ffffff",
            lineHeight: 1.2,
          }}>
            {step.title}
          </h3>

          <p style={{
            margin: "0 0 14px",
            color: "rgba(255,255,255,0.55)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.88rem, 1.3vw, 1rem)",
            lineHeight: 1.68,
            maxWidth: 440,
          }}>
            {step.description}
          </p>

          {/* Detail chip */}
          <motion.div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: `${step.color}14`,
              border: `1px solid ${step.color}30`,
              borderRadius: 100,
              padding: "5px 14px",
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, ease: EASE_SPRING, delay: index * 0.1 + 0.3 }}
          >
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: "0.72rem",
              letterSpacing: "0.06em",
              color: step.color,
            }}>
              {step.detail}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

/* ── Section ─────────────────────────────────────── */
export const LandingHowItWorks: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-80px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const lineH = useTransform(scrollYProgress, [0.1, 0.8], ["0%", "100%"]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      style={{
        background: "#0D0A1A",
        padding: "clamp(60px, 10vw, 130px) clamp(20px, 5vw, 80px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Parallax BG grid */}
      <motion.div
        aria-hidden
        style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(96,52,225,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(96,52,225,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          pointerEvents: "none",
          y: bgY,
        }}
      />

      {/* Scroll progress line (left edge) */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
        background: "rgba(96,52,225,0.08)",
      }}>
        <motion.div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          background: "linear-gradient(to bottom, #6034E1, #10B981)",
          height: lineH,
          borderRadius: 2,
        }} />
      </div>

      {/* Accent blob */}
      <motion.div aria-hidden style={{
        position: "absolute",
        top: "5%", right: "-8%",
        width: "45vw", height: "45vw",
        maxWidth: 550, maxHeight: 550,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(96,52,225,0.1) 0%, transparent 65%)",
        filter: "blur(90px)",
        pointerEvents: "none",
      }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div aria-hidden style={{
        position: "absolute",
        bottom: "5%", left: "-5%",
        width: "30vw", height: "30vw",
        maxWidth: 380, maxHeight: 380,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)",
        filter: "blur(70px)",
        pointerEvents: "none",
      }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div
        className="how-it-works-grid"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr min(480px, 44%)",
          gap: "clamp(40px, 6vw, 80px)",
          alignItems: "start",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left: sticky title + stats */}
        <div ref={titleRef} style={{ position: "sticky", top: "clamp(80px, 10vw, 120px)" }}>
          <motion.div
            style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}
            initial={{ opacity: 0, x: -24 }}
            animate={titleInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE_SPRING }}
          >
            <motion.span
              style={{ display: "block", height: 1, background: "#10B981", width: 0 }}
              animate={titleInView ? { width: 28 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE_EXPO }}
            />
            <span style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 600,
              fontSize: "0.72rem", letterSpacing: "0.2em",
              textTransform: "uppercase", color: "#10B981",
            }}>
              Como Funciona
            </span>
          </motion.div>

          <div style={{ overflow: "hidden" }}>
            <motion.h2
              style={{
                margin: 0,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2.2rem, 4.5vw, 4rem)",
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
                color: "#ffffff",
              }}
              initial={{ y: "105%", opacity: 0 }}
              animate={titleInView ? { y: "0%", opacity: 1 } : {}}
              transition={{ duration: 0.9, ease: EASE_SPRING, delay: 0.1 }}
            >
              Simples do
              <br />
              <span style={{ color: "#10B981" }}>início ao fim.</span>
            </motion.h2>
          </div>

          <motion.p style={{
            margin: "clamp(16px, 2vw, 24px) 0 0",
            color: "rgba(255,255,255,0.42)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.9rem, 1.3vw, 1.05rem)",
            lineHeight: 1.65,
          }}
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE_SPRING, delay: 0.25 }}
          >
            4 passos é tudo que precisa para ter controle total das encomendas do seu condomínio.
          </motion.p>

          {/* Stats */}
          <motion.div
            style={{
              display: "flex",
              gap: "clamp(20px, 3vw, 36px)",
              marginTop: "clamp(28px, 4vw, 48px)",
              flexWrap: "wrap",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE_SPRING, delay: 0.38 }}
          >
            {[
              { value: "<30s", label: "Para registrar", color: "#6034E1" },
              { value: "0", label: "Extravios", color: "#10B981" },
              { value: "100%", label: "Rastreado", color: "#8B5CF6" },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                  letterSpacing: "-0.04em",
                  color: stat.color,
                  lineHeight: 1,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.28)",
                  marginTop: 5,
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Steps */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {steps.map((step, i) => (
            <Step key={step.number} step={step} index={i} isLast={i === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
};
