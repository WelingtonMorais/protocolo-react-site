import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ApartmentIcon from "@mui/icons-material/Apartment";
import { AnimatePresence, motion } from "framer-motion";
import type { SvgIconComponent } from "@mui/icons-material";

import { trackEvent } from "@/lib/analytics";
import {
  buildReferralWhatsAppShareUrl,
} from "@/lib/referral-share";

interface FirstAccessClientDialogProps {
  open: boolean;
  onClose: () => void;
  userName?: string | null;
  onOpenReferralForm: () => void;
  onOpenLink: () => void;
}

const SLIDE_COUNT = 3;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export const FirstAccessClientDialog = ({
  open,
  onClose,
  userName,
  onOpenReferralForm,
  onOpenLink,
}: FirstAccessClientDialogProps): React.JSX.Element => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (open) {
      setSlide(0);
      setDirection(1);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    trackEvent("client_first_modal_view", { slide });
  }, [open, slide]);

  const goNext = (): void => {
    setDirection(1);
    setSlide((s) => Math.min(SLIDE_COUNT - 1, s + 1));
  };

  const goBack = (): void => {
    setDirection(-1);
    setSlide((s) => Math.max(0, s - 1));
  };

  const handleClose = (): void => {
    trackEvent("client_first_modal_cta", { source: "modal", action: "skip", slide });
    onClose();
  };

  const handleWhatsApp = (): void => {
    trackEvent("client_first_modal_cta", { source: "modal", action: "whatsapp" });
    trackEvent("referral_whatsapp_share", { source: "modal" });
    const url = buildReferralWhatsAppShareUrl(userName ?? null);
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  const handleReferralForm = (): void => {
    trackEvent("client_first_modal_cta", { source: "modal", action: "lead_form" });
    onOpenReferralForm();
    onClose();
  };

  const handleHaveCode = (): void => {
    trackEvent("client_first_modal_cta", { source: "modal", action: "i_have_code" });
    onOpenLink();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background:
            "linear-gradient(160deg, #0D0A1A 0%, #1a1233 50%, #0D0A1A 100%)",
          color: "#fff",
          overflow: "hidden",
          minHeight: { xs: "100dvh", sm: 560 },
          borderRadius: { xs: 0, sm: 3 },
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: "55%",
          height: "55%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(96,52,225,0.35) 0%, transparent 65%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "55%",
          height: "55%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 65%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <IconButton
        aria-label="Pular apresentação"
        onClick={handleClose}
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          color: "rgba(255,255,255,0.65)",
          zIndex: 3,
          "&:hover": { color: "#fff" },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: { xs: "100dvh", sm: 560 },
          px: { xs: 3, sm: 6 },
          py: { xs: 5, sm: 6 },
        }}
      >
        <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={slide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: EASE }}
              style={{ width: "100%" }}
            >
              {slide === 0 && (
                <SlideDor userName={userName ?? null} />
              )}
              {slide === 1 && <SlideValor />}
              {slide === 2 && (
                <SlideConvite
                  onWhatsApp={handleWhatsApp}
                  onReferralForm={handleReferralForm}
                  onHaveCode={handleHaveCode}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </Box>

        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3, mb: 2 }}>
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <Box
              key={i}
              sx={{
                width: i === slide ? 28 : 8,
                height: 8,
                borderRadius: 4,
                background:
                  i === slide
                    ? "linear-gradient(90deg,#6034E1,#10B981)"
                    : "rgba(255,255,255,0.2)",
                transition: "width 0.3s ease",
              }}
            />
          ))}
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            onClick={slide === 0 ? handleClose : goBack}
            startIcon={slide === 0 ? undefined : <ArrowBackIcon />}
            sx={{ color: "rgba(255,255,255,0.65)", "&:hover": { color: "#fff" } }}
          >
            {slide === 0 ? "Pular" : "Voltar"}
          </Button>

          {slide < SLIDE_COUNT - 1 ? (
            <Button
              onClick={goNext}
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                background: "linear-gradient(135deg,#6034E1,#8B5CF6)",
                fontWeight: 700,
                px: 3,
                py: 1.2,
                borderRadius: 2,
                "&:hover": {
                  background: "linear-gradient(135deg,#7140e8,#9466f6)",
                  boxShadow: "0 8px 24px rgba(96,52,225,0.5)",
                },
              }}
            >
              Continuar
            </Button>
          ) : (
            <Box />
          )}
        </Stack>
      </Box>
    </Dialog>
  );
};

const SlideDor = ({ userName }: { userName: string | null }): React.JSX.Element => {
  const greeting = userName ? `Oi, ${userName.split(" ")[0]}.` : "Oi.";
  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <Typography
        variant="overline"
        sx={{
          color: "#9B77F5",
          letterSpacing: "0.18em",
          fontWeight: 700,
        }}
      >
        Apresentação rápida
      </Typography>

      <Typography
        sx={{
          fontSize: { xs: "1.1rem", sm: "1.3rem" },
          color: "rgba(255,255,255,0.6)",
        }}
      >
        {greeting}
      </Typography>

      <Typography
        component="h2"
        sx={{
          fontWeight: 800,
          fontSize: { xs: "2rem", sm: "3.2rem" },
          lineHeight: 1.05,
          letterSpacing: "-0.04em",
        }}
      >
        Sua encomenda chegou.
        <br />
        Você não sabe.
      </Typography>

      <Typography
        sx={{
          color: "rgba(255,255,255,0.7)",
          fontSize: { xs: "1rem", sm: "1.15rem" },
          lineHeight: 1.6,
          maxWidth: 540,
        }}
      >
        Recados que somem no grupo do WhatsApp. Filas na portaria sem motivo. Caixas
        misturadas no balcão. E aquela dúvida: <em>chegou ou não chegou?</em>
      </Typography>

      <Typography
        sx={{
          color: "rgba(255,255,255,0.45)",
          fontSize: "0.9rem",
          fontStyle: "italic",
        }}
      >
        Você não vai mais passar por isso. E o seu vizinho também não.
      </Typography>
    </Stack>
  );
};

const SlideValor = (): React.JSX.Element => {
  const benefits: { icon: SvgIconComponent; title: string; body: string }[] = [
    {
      icon: NotificationsActiveOutlinedIcon,
      title: "Avisado na hora",
      body: "Notificação push no segundo em que a portaria registra. Sem grupo de WhatsApp no meio.",
    },
    {
      icon: QrCode2Icon,
      title: "Retira em 10 segundos",
      body: "Código de retirada no app, fila zero. Você só passa, mostra e leva.",
    },
    {
      icon: ShieldOutlinedIcon,
      title: "Histórico rastreado",
      body: "Quem registrou, quem entregou, quando. Acabou o sumiço de encomenda.",
    },
  ];

  return (
    <Stack spacing={3.5} sx={{ maxWidth: 640 }}>
      <Typography
        variant="overline"
        sx={{ color: "#10B981", letterSpacing: "0.18em", fontWeight: 700 }}
      >
        Como o app resolve
      </Typography>
      <Typography
        component="h2"
        sx={{
          fontWeight: 800,
          fontSize: { xs: "1.9rem", sm: "2.8rem" },
          lineHeight: 1.05,
          letterSpacing: "-0.04em",
        }}
      >
        Em 30 segundos, da portaria pra você.
      </Typography>

      <Stack spacing={2}>
        {benefits.map(({ icon: Icon, title, body }) => (
          <Stack
            key={title}
            direction="row"
            spacing={2}
            alignItems="flex-start"
            sx={{
              p: 2,
              borderRadius: 2,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg,#6034E1,#8B5CF6)",
                flexShrink: 0,
              }}
            >
              <Icon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
                {title}
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                  mt: 0.3,
                }}
              >
                {body}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

interface SlideConviteProps {
  onWhatsApp: () => void;
  onReferralForm: () => void;
  onHaveCode: () => void;
}

const SlideConvite = ({
  onWhatsApp,
  onReferralForm,
  onHaveCode,
}: SlideConviteProps): React.JSX.Element => (
  <Stack spacing={3} sx={{ maxWidth: 640 }}>
    <Typography
      variant="overline"
      sx={{ color: "#F59E0B", letterSpacing: "0.18em", fontWeight: 700 }}
    >
      Você é o pivô disso acontecer
    </Typography>
    <Typography
      component="h2"
      sx={{
        fontWeight: 800,
        fontSize: { xs: "1.9rem", sm: "2.6rem" },
        lineHeight: 1.05,
        letterSpacing: "-0.04em",
      }}
    >
      Traga seu condomínio.
      <br />
      <Box
        component="span"
        sx={{
          background: "linear-gradient(90deg,#6034E1,#10B981)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Em um WhatsApp.
      </Box>
    </Typography>

    <Typography
      sx={{
        color: "rgba(255,255,255,0.7)",
        fontSize: { xs: "1rem", sm: "1.1rem" },
        lineHeight: 1.6,
      }}
    >
      O síndico não precisa decidir nada agora — só testar. A implantação é guiada pela nossa
      equipe e o app é gratuito para avaliação. Quem ganha são os moradores e a portaria.
    </Typography>

    <Stack spacing={1.5} sx={{ mt: 1 }}>
      <Button
        onClick={onWhatsApp}
        variant="contained"
        size="large"
        startIcon={<WhatsAppIcon />}
        sx={{
          background: "linear-gradient(135deg,#25D366,#128C7E)",
          fontWeight: 700,
          py: 1.4,
          borderRadius: 2,
          fontSize: "1rem",
          "&:hover": {
            background: "linear-gradient(135deg,#1fbe5b,#0f6f63)",
            boxShadow: "0 8px 24px rgba(37,211,102,0.45)",
          },
        }}
      >
        Convidar meu síndico no WhatsApp
      </Button>

      <Button
        onClick={onReferralForm}
        variant="outlined"
        size="large"
        startIcon={<ChatBubbleOutlineIcon />}
        sx={{
          color: "#fff",
          borderColor: "rgba(255,255,255,0.3)",
          py: 1.3,
          borderRadius: 2,
          fontWeight: 600,
          "&:hover": {
            borderColor: "#fff",
            background: "rgba(255,255,255,0.06)",
          },
        }}
      >
        Quero que vocês falem com meu síndico
      </Button>

      <Button
        onClick={onHaveCode}
        startIcon={<ApartmentIcon />}
        sx={{
          color: "rgba(255,255,255,0.6)",
          fontWeight: 500,
          alignSelf: "flex-start",
          mt: 0.5,
          "&:hover": {
            color: "#fff",
            background: "transparent",
            textDecoration: "underline",
          },
        }}
      >
        Já tenho o código do meu condomínio
      </Button>
    </Stack>
  </Stack>
);
