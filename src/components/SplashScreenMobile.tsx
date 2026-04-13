import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import logoApp from "../../assets/logo_app.png";
import type { SplashScreenBaseProps } from "./SplashScreenDesktop";

const PANELS = 6;
const HOLD_MS = 2400;
const PANEL_STAGGER_MS = 70;
const PANEL_DURATION_MS = 580;

/**
 * Splash dedicada a touch / viewport estreito.
 * Sem Framer Motion no layout — só HTML/CSS e animações em classes globais,
 * para não haver conflito com transform em WebViews e browsers mobile.
 */
export const SplashScreenMobile: React.FC<SplashScreenBaseProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<"intro" | "exit">("intro");
  const completedRef = useRef(false);

  useEffect(() => {
    document.body.classList.add("splash-no-scroll");
    const t = setTimeout(() => setPhase("exit"), HOLD_MS);
    return () => {
      clearTimeout(t);
      document.body.classList.remove("splash-no-scroll");
    };
  }, []);

  useEffect(() => {
    if (phase !== "exit") return;
    const total =
      (PANELS - 1) * PANEL_STAGGER_MS + PANEL_DURATION_MS + 80;
    const t = window.setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete();
    }, total);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      <div
        className={`splash-mobile-root ${phase === "exit" ? "splash-mobile-root--exit" : ""}`}
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
          paddingLeft: "max(20px, env(safe-area-inset-left, 0px))",
          paddingRight: "max(20px, env(safe-area-inset-right, 0px))",
          paddingTop: "max(16px, env(safe-area-inset-top, 0px))",
          paddingBottom: "max(56px, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="splash-mobile-grid" aria-hidden />

        <div className="splash-mobile-content">
          <div className="splash-mobile-logo-wrap">
            <img
              src={logoApp}
              alt=""
              className="splash-mobile-logo"
              width={88}
              height={88}
            />
          </div>

          {/* Duas linhas: evita overflow horizontal em qualquer largura */}
          <div className="splash-mobile-title-block">
            <div className="splash-mobile-title-line splash-mobile-title-line--delay1">PROTO</div>
            <div className="splash-mobile-title-line splash-mobile-title-line--delay2">COLO</div>
          </div>

          <div className="splash-mobile-rule" />

          <p className="splash-mobile-tagline">Sistema de Encomendas</p>
        </div>

        <div className="splash-mobile-dots" aria-hidden>
          <span className="splash-mobile-dot" />
          <span className="splash-mobile-dot splash-mobile-dot--on" />
          <span className="splash-mobile-dot" />
        </div>
      </div>

      {phase === "exit" &&
        Array.from({ length: PANELS }).map((_, i) => (
          <div
            key={i}
            className={
              i % 2 === 0 ? "splash-mobile-panel" : "splash-mobile-panel splash-mobile-panel--alt"
            }
            style={{
              left: `${(i / PANELS) * 100}%`,
              width: `${100 / PANELS + 0.25}%`,
              animationDelay: `${i * PANEL_STAGGER_MS}ms`,
            }}
          />
        ))}
    </>,
    document.body
  );
};
