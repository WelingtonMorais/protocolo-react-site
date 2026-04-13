import React, { useEffect, useState } from "react";
import { SplashScreenDesktop } from "./SplashScreenDesktop";
import { SplashScreenMobile } from "./SplashScreenMobile";

/** Largura máxima para usar splash mobile (tablets em portrait entram como mobile) */
const MOBILE_MAX_WIDTH = 768;

function useMatchMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

export interface SplashScreenProps {
  onComplete: () => void;
}

/**
 * Desktop: splash cinematográfica com Framer Motion (inalterada).
 * Mobile / viewport ≤768px: splash simplificada só com CSS (sem conflitos de layout).
 */
export const SplashScreen: React.FC<SplashScreenProps> = (props) => {
  const isMobile = useMatchMobile();
  if (isMobile) {
    return <SplashScreenMobile {...props} />;
  }
  return <SplashScreenDesktop {...props} />;
};
