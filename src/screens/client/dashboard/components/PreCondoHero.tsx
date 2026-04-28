import React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import KeyIcon from "@mui/icons-material/Key";
import ReplayIcon from "@mui/icons-material/Replay";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { motion } from "framer-motion";

import { trackEvent } from "@/lib/analytics";
import { buildReferralWhatsAppShareUrl } from "@/lib/referral-share";

interface PreCondoHeroProps {
  userName?: string | null;
  hasPendingAccess: boolean;
  onOpenLink: () => void;
  onOpenReferral: () => void;
  onReopenWelcome: () => void;
}

const FADE_TRANSITION = { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

export const PreCondoHero = ({
  userName,
  hasPendingAccess,
  onOpenLink,
  onOpenReferral,
  onReopenWelcome,
}: PreCondoHeroProps): React.JSX.Element => {
  const handleWhatsApp = (): void => {
    trackEvent("referral_whatsapp_share", { source: "hero" });
    const url = buildReferralWhatsAppShareUrl(userName ?? null);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleReferral = (): void => {
    trackEvent("client_first_modal_cta", { source: "hero", action: "lead_form" });
    onOpenReferral();
  };

  const handleHaveCode = (): void => {
    trackEvent("client_first_modal_cta", { source: "hero", action: "i_have_code" });
    onOpenLink();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={FADE_TRANSITION}
      style={{ marginBottom: 24 }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 3,
          color: "#fff",
          background:
            "linear-gradient(135deg, #1a1233 0%, #2a1a55 50%, #0f3a30 100%)",
          p: { xs: 2.5, sm: 4 },
          boxShadow: "0 12px 40px rgba(96,52,225,0.25)",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: "-30%",
            right: "-15%",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(96,52,225,0.45) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            bottom: "-25%",
            left: "-10%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <Stack spacing={2.5} sx={{ position: "relative", zIndex: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            flexWrap="wrap"
          >
            <Chip
              label={hasPendingAccess ? "Aguardando aprovação" : "Próximo passo"}
              size="small"
              icon={
                hasPendingAccess ? (
                  <HourglassEmptyIcon sx={{ color: "#F59E0B !important" }} />
                ) : undefined
              }
              sx={{
                bgcolor: "rgba(255,255,255,0.12)",
                color: "#fff",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontSize: "0.7rem",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            />
            <Button
              onClick={onReopenWelcome}
              size="small"
              startIcon={<ReplayIcon />}
              sx={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.78rem",
                "&:hover": { color: "#fff", background: "rgba(255,255,255,0.06)" },
              }}
            >
              Rever apresentação
            </Button>
          </Stack>

          <Box>
            <Typography
              component="h2"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.03em",
                fontSize: { xs: "1.6rem", sm: "2.2rem" },
                lineHeight: 1.1,
              }}
            >
              {hasPendingAccess
                ? "Quase lá! Enquanto isso, leve o app para outros condomínios."
                : "Falta um passo: traga seu condomínio."}
            </Typography>
            <Typography
              sx={{
                mt: 1,
                color: "rgba(255,255,255,0.72)",
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                lineHeight: 1.55,
                maxWidth: 720,
              }}
            >
              {hasPendingAccess
                ? "Você já solicitou acesso. A portaria vai aprovar em instantes. Que tal indicar o app para outro síndico que conhece? Ajuda outros moradores e prepara terreno para o seu próprio condomínio."
                : "Sem o condomínio cadastrado, você não recebe notificação nem retira encomenda pelo app. Você é a pessoa certa para falar com o síndico — nós cuidamos do resto."}
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ pt: 0.5 }}
          >
            <BenefitPill
              icon={<NotificationsActiveOutlinedIcon sx={{ fontSize: 18 }} />}
              text="Notificação na hora"
            />
            <BenefitPill
              icon={<QrCode2Icon sx={{ fontSize: 18 }} />}
              text="Retirada com QR"
            />
            <BenefitPill
              icon={<ShieldOutlinedIcon sx={{ fontSize: 18 }} />}
              text="Histórico rastreado"
            />
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ pt: 1 }}
          >
            <Button
              onClick={handleWhatsApp}
              variant="contained"
              size="large"
              startIcon={<WhatsAppIcon />}
              sx={{
                flex: { xs: "0 0 auto", sm: 1 },
                background: "linear-gradient(135deg,#25D366,#128C7E)",
                fontWeight: 700,
                py: 1.3,
                borderRadius: 2,
                "&:hover": {
                  background: "linear-gradient(135deg,#1fbe5b,#0f6f63)",
                  boxShadow: "0 8px 24px rgba(37,211,102,0.4)",
                },
              }}
            >
              Convidar síndico no WhatsApp
            </Button>
            <Button
              onClick={handleReferral}
              variant="outlined"
              size="large"
              startIcon={<ChatBubbleOutlineIcon />}
              sx={{
                flex: { xs: "0 0 auto", sm: 1 },
                color: "#fff",
                borderColor: "rgba(255,255,255,0.35)",
                py: 1.3,
                borderRadius: 2,
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#fff",
                  background: "rgba(255,255,255,0.06)",
                },
              }}
            >
              Falar com meu síndico
            </Button>
          </Stack>

          <Button
            onClick={handleHaveCode}
            startIcon={<KeyIcon />}
            size="small"
            sx={{
              alignSelf: "flex-start",
              color: "rgba(255,255,255,0.7)",
              fontWeight: 500,
              "&:hover": {
                color: "#fff",
                background: "transparent",
                textDecoration: "underline",
              },
            }}
          >
            Já tenho o código do condomínio
          </Button>
        </Stack>
      </Box>
    </motion.div>
  );
};

const BenefitPill = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}): React.JSX.Element => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={1}
    sx={{
      px: 1.5,
      py: 0.8,
      borderRadius: 2,
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "rgba(255,255,255,0.85)",
      fontSize: "0.85rem",
      fontWeight: 500,
      flex: { xs: "0 0 auto", sm: 1 },
      justifyContent: { xs: "flex-start", sm: "center" },
    }}
  >
    {icon}
    <Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>{text}</Typography>
  </Stack>
);
