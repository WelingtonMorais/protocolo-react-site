import React, { useEffect, useRef, useState } from "react";

/**
 * Montfort-style custom cursor:
 * - .cursor-dot follows mouse instantly
 * - .cursor-circle follows with lerp (lagged)
 * - .cursor-dot-left / right appear on interactive hover
 * - Not rendered at all on touch/mobile devices
 */
export const CustomCursor = (): React.JSX.Element | null => {
  const circleRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const dotLeftRef = useRef<HTMLDivElement>(null);
  const dotRightRef = useRef<HTMLDivElement>(null);
  const [isPointerDevice, setIsPointerDevice] = useState(false);

  useEffect(() => {
    // Only enable on real pointer devices (mouse/trackpad), not touch
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) return;
    setIsPointerDevice(true);

    let mouseX = 0;
    let mouseY = 0;
    let circleX = 0;
    let circleY = 0;
    let raf: number;

    const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

    const animate = (): void => {
      circleX = lerp(circleX, mouseX, 0.12);
      circleY = lerp(circleY, mouseY, 0.12);

      if (circleRef.current) {
        circleRef.current.style.transform = `translate(${circleX}px, ${circleY}px) translate(-50%, -50%)`;
      }
      if (dotLeftRef.current) {
        dotLeftRef.current.style.transform = `translate(${circleX - 16}px, ${circleY}px) translate(-50%, -50%)`;
      }
      if (dotRightRef.current) {
        dotRightRef.current.style.transform = `translate(${circleX + 16}px, ${circleY}px) translate(-50%, -50%)`;
      }

      raf = requestAnimationFrame(animate);
    };

    const onMouseMove = (e: MouseEvent): void => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };

    const onMouseOver = (e: MouseEvent): void => {
      const target = e.target as Element;
      const isInteractive = target.closest(
        'a, button, [role="button"], input, textarea, select, label, [tabindex]'
      );
      if (isInteractive) {
        document.body.classList.add("cursor-hovering");
      } else {
        document.body.classList.remove("cursor-hovering");
      }
    };

    const onMouseDown = (): void => {
      document.body.classList.add("cursor-clicking");
    };

    const onMouseUp = (): void => {
      document.body.classList.remove("cursor-clicking");
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    raf = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Don't render anything on touch/mobile devices
  if (!isPointerDevice) return null;

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={circleRef} className="cursor-circle" />
      <div ref={dotRef} className="cursor-dot" />
      <div ref={dotLeftRef} className="cursor-dot-left" />
      <div ref={dotRightRef} className="cursor-dot-right" />
    </div>
  );
};
