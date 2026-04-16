import React, { forwardRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Paper,
  Slide,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { SlideProps } from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import { AnimatePresence, motion } from "framer-motion";
import GetAppIcon from "@mui/icons-material/GetApp";
import IosShareIcon from "@mui/icons-material/IosShare";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddToHomeScreenIcon from "@mui/icons-material/AddToHomeScreen";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";

import { usePwaInstallNudge } from "@/hooks/usePwaInstallNudge";

const SlideUp = forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...(props as SlideProps)} />;
});

interface Step {
  icon: React.ReactNode;
  text: string;
}

const androidSteps: Step[] = [
  {
    icon: <MoreVertIcon fontSize="small" />,
    text: 'Toque no menu ⋮ (três pontinhos) no canto superior direito do Chrome.',
  },
  {
    icon: <AddToHomeScreenIcon fontSize="small" />,
    text: 'Selecione "Adicionar à tela inicial" e confirme.',
  },
  {
    icon: <CheckCircleIcon fontSize="small" />,
    text: 'Abra o Protocolo pelo ícone novo — notificações push ativam automaticamente.',
  },
];

const iosSteps: Step[] = [
  {
    icon: <IosShareIcon fontSize="small" />,
    text: 'Toque no botão Partilhar (quadrado com seta ↑) na barra do Safari.',
  },
  {
    icon: <AddToHomeScreenIcon fontSize="small" />,
    text: '"Adicionar à ecrã principal" ou "Adicionar à tela inicial".',
  },
  {
    icon: <CheckCircleIcon fontSize="small" />,
    text: 'Confirme. Abra pelo ícone novo — as notificações push ficam disponíveis.',
  },
];

const infinitePulse = {
  animate: { scale: [1, 1.08, 1] },
  transition: { repeat: Infinity, duration: 2.2, ease: "easeInOut" as const },
};

const infiniteBounce = {
  animate: { y: [0, -5, 0] },
  transition: { repeat: Infinity, duration: 1.9, ease: "easeInOut" as const },
};

/**
 * Convite a instalar o Protocolo como PWA.
 * Chrome/Edge: dispara o prompt nativo. iOS/Android manual: abre Dialog com os passos.
 */
export const PwaInstallNudge = (): React.JSX.Element | null => {
  const { visible, canUseNativePrompt, isAndroidManual, busy, promptInstall, dismiss } =
    usePwaInstallNudge();
  const [dialogOpen, setDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!visible) return null;

  const steps = isAndroidManual ? androidSteps : iosSteps;
  const platformLabel = isAndroidManual ? "Android" : "iPhone / iPad";

  return (
    <>
      {/* ── Banner ── */}
      <motion.div
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ marginBottom: 16 }}
      >
        <Paper
          elevation={0}
          sx={{
            border: `1.5px solid`,
            borderColor: "primary.light",
            borderRadius: 3,
            p: 2.5,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}0D 0%, ${theme.palette.background.paper} 60%)`,
          }}
        >
          {/* Icon + title row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <motion.div
                animate={infiniteBounce.animate}
                transition={infiniteBounce.transition}
              >
                <GetAppIcon fontSize="small" />
              </motion.div>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} lineHeight={1.3}>
                {canUseNativePrompt
                  ? "Instale o Protocolo como app"
                  : "Adicione à sua tela inicial"}
              </Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1.3}>
                {canUseNativePrompt
                  ? "Abre mais rápido e ativa notificações push"
                  : `Necessário para notificações no ${platformLabel}`}
              </Typography>
            </Box>
          </Box>

          {/* Body text */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
            {canUseNativePrompt
              ? "Com o app instalado você recebe alertas de encomendas em tempo real, mesmo com o navegador fechado."
              : isAndroidManual
                ? "Sem instalar, as notificações push não funcionam. Leva menos de 30 segundos pelo menu do Chrome."
                : "No iPhone/iPad as notificações push só funcionam com o site instalado na tela inicial. Rápido pelo Safari."}
          </Typography>

          {/* Primary CTA */}
          {canUseNativePrompt ? (
            <motion.div animate={infinitePulse.animate} transition={infinitePulse.transition}>
              <Button
                variant="contained"
                fullWidth
                size="medium"
                startIcon={<GetAppIcon />}
                disabled={busy}
                onClick={() => void promptInstall()}
                sx={{ borderRadius: 2, fontWeight: 700, mb: 1 }}
              >
                {busy ? "Abrindo…" : "Instalar agora — é grátis"}
              </Button>
            </motion.div>
          ) : (
            <motion.div animate={infinitePulse.animate} transition={infinitePulse.transition}>
              <Button
                variant="contained"
                fullWidth
                size="medium"
                startIcon={<PhoneIphoneIcon />}
                onClick={() => setDialogOpen(true)}
                sx={{ borderRadius: 2, fontWeight: 700, mb: 1 }}
              >
                Ver como instalar (30 seg)
              </Button>
            </motion.div>
          )}

          {/* Dismiss — subtle */}
          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="text"
              size="small"
              onClick={dismiss}
              sx={{ opacity: 0.42, fontSize: "0.7rem", color: "text.secondary" }}
            >
              agora não
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {/* ── Dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullScreen={isMobile}
        maxWidth="xs"
        fullWidth
        TransitionComponent={SlideUp}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3, overflow: "hidden" } }}
      >
        {/* Colored header */}
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            px: 3,
            pt: 4,
            pb: 3,
            textAlign: "center",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            style={{ display: "inline-flex", marginBottom: 12 }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                bgcolor: "primary.contrastText",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AddToHomeScreenIcon sx={{ fontSize: 36 }} />
            </Box>
          </motion.div>

          <Typography variant="h6" fontWeight={800} gutterBottom>
            Instale agora para ativar tudo
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.88, lineHeight: 1.5 }}>
            Sem instalar, as notificações push <strong>não funcionam</strong> no {platformLabel}.
            <br />
            Leva menos de 30 segundos.
          </Typography>
        </Box>

        <DialogContent sx={{ px: 3, py: 3 }}>
          <AnimatePresence>
            {dialogOpen && (
              <Box component="ol" sx={{ m: 0, p: 0, listStyle: "none" }}>
                {steps.map((step, i) => (
                  <motion.li
                    key={i}
                    initial={{ x: -24, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.13, duration: 0.35, ease: "easeOut" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                        mb: i < steps.length - 1 ? 2.5 : 0,
                      }}
                    >
                      {/* Step circle */}
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {step.icon}
                        </Box>
                        {i < steps.length - 1 && (
                          <Box
                            sx={{
                              width: 2,
                              flex: 1,
                              minHeight: 20,
                              bgcolor: "primary.light",
                              opacity: 0.4,
                              mt: 0.5,
                            }}
                          />
                        )}
                      </Box>

                      {/* Step text */}
                      <Box sx={{ pt: 0.5, pb: i < steps.length - 1 ? 2.5 : 0 }}>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          color="primary"
                          sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}
                        >
                          Passo {i + 1}
                        </Typography>
                        <Typography variant="body2" color="text.primary" lineHeight={1.55}>
                          {step.text}
                        </Typography>
                      </Box>
                    </Box>
                  </motion.li>
                ))}
              </Box>
            )}
          </AnimatePresence>

          {/* Actions */}
          <Box sx={{ mt: 3 }}>
            <motion.div animate={infinitePulse.animate} transition={infinitePulse.transition}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<CheckCircleIcon />}
                onClick={() => setDialogOpen(false)}
                sx={{ borderRadius: 2, fontWeight: 700, mb: 1.5 }}
              >
                Entendi, vou instalar agora
              </Button>
            </motion.div>
            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="text"
                size="small"
                onClick={() => { setDialogOpen(false); dismiss(); }}
                sx={{ opacity: 0.38, fontSize: "0.68rem", color: "text.secondary" }}
              >
                fechar
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
