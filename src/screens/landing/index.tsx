import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import { LandingHeader } from "./components/LandingHeader";
import { LandingHero } from "./components/LandingHero";
import { LandingMarquee } from "./components/LandingMarquee";
import { LandingFeatures } from "./components/LandingFeatures";
import { LandingHowItWorks } from "./components/LandingHowItWorks";
import { LandingCTA } from "./components/LandingCTA";
import { CustomCursor } from "../../components/ui/CustomCursor";

export const LandingPage: React.FC = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <CustomCursor />
      <LandingHeader />
      <main style={{ background: "#0D0A1A" }}>
        <LandingHero />
        <LandingMarquee />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingCTA />
      </main>
    </>
  );
};
