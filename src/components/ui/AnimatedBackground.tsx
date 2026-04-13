import React from "react";
import { Box } from "@mui/material";

/**
 * Montfort-style animated background for auth pages.
 * Replaces the WebGL canvas with pure CSS:
 * - Three animated gradient blobs
 * - CSS grid mesh overlay (from .auth-side-left::before in global.css)
 */
export const AnimatedBackground = (): React.JSX.Element => {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Blob 1 — main violet */}
      <Box
        sx={{
          position: "absolute",
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(96,52,225,0.35) 0%, rgba(96,52,225,0) 70%)",
          top: "-10%",
          left: "-10%",
          animation: "blobMove1 14s ease-in-out infinite",
          willChange: "transform",
          filter: "blur(40px)",
        }}
      />
      {/* Blob 2 — deep indigo */}
      <Box
        sx={{
          position: "absolute",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0) 70%)",
          bottom: "5%",
          right: "-5%",
          animation: "blobMove2 18s ease-in-out infinite",
          willChange: "transform",
          filter: "blur(50px)",
        }}
      />
      {/* Blob 3 — emerald accent */}
      <Box
        sx={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0) 70%)",
          top: "50%",
          left: "50%",
          animation: "blobMove3 22s ease-in-out infinite",
          willChange: "transform",
          filter: "blur(30px)",
        }}
      />

      {/* Spinning orbit ring — Montfort hero spinner */}
      <Box
        sx={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: 180,
          height: 180,
          opacity: 0.15,
        }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%", animation: "spinOrbit 16s linear infinite" }}
        >
          <defs>
            <linearGradient id="orbitGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6034E1" stopOpacity="0" />
              <stop offset="50%" stopColor="#6034E1" stopOpacity="1" />
              <stop offset="100%" stopColor="#6034E1" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="92" stroke="url(#orbitGrad1)" strokeWidth="2" strokeDasharray="8 6" />
        </svg>
      </Box>

      {/* Second orbit ring (counter-clockwise) */}
      <Box
        sx={{
          position: "absolute",
          top: "8%",
          left: "15%",
          width: 120,
          height: 120,
          opacity: 0.1,
        }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: "100%",
            height: "100%",
            animation: "spinOrbitReverse 20s linear infinite",
          }}
        >
          <circle cx="100" cy="100" r="90" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="12 8" />
        </svg>
      </Box>

      {/* Small dots grid accent */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(96,52,225,0.2) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          animation: "gridPulse 6s ease-in-out infinite",
        }}
      />
    </Box>
  );
};
