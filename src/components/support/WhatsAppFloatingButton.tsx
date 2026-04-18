import type { FC } from "react";
import { motion } from "framer-motion";

import { buildWhatsAppSupportUrl } from "@/lib/whatsapp-support";

import { WhatsAppIcon } from "./WhatsAppIcon";

export const WhatsAppFloatingButton: FC = () => {
  const href = buildWhatsAppSupportUrl("landing");

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com suporte no WhatsApp"
      style={{
        position: "fixed",
        right: "clamp(16px, 4vw, 28px)",
        bottom: "clamp(16px, 4vw, 28px)",
        zIndex: 12000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "#25D366",
        color: "#fff",
        boxShadow: "0 4px 20px rgba(37, 211, 102, 0.45)",
        textDecoration: "none",
      }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      animate={{ scale: [1, 1.045, 1] }}
      transition={{
        scale: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <WhatsAppIcon sx={{ fontSize: 30 }} />
    </motion.a>
  );
};
