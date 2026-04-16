import React from "react";
import { Alert, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/providers/AuthProvider";
import { useNotificationUI } from "@/providers/NotificationUIProvider";
import { humanMessageForBlockReason } from "@/utils/web-push-env";

export const PushNudgeBanner = (): React.JSX.Element | null => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    needsPushNudge,
    pushPermission,
    pushSupported,
    needsIosPwaInstallHint,
  } = useNotificationUI();

  if (!user) return null;

  const settingsPath = user.role === "CLIENT" ? "/morador/configuracoes" : "/operador/configuracoes";

  if (needsIosPwaInstallHint) {
    return (
      <Box sx={{ mb: 2 }}>
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={() => navigate(settingsPath)}>
              Detalhes
            </Button>
          }
        >
          {humanMessageForBlockReason("ios_needs_pwa")}
        </Alert>
      </Box>
    );
  }

  if (!pushSupported || !needsPushNudge) return null;

  const message =
    pushPermission === "denied"
      ? "Notificacoes estao bloqueadas no navegador. Ative para receber avisos de encomendas e alertas em tempo real."
      : "Ative as notificacoes para nao perder avisos de encomendas e atualizacoes importantes em tempo real.";

  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity="warning"
        action={
          <Button color="inherit" size="small" onClick={() => navigate(settingsPath)}>
            Ir para configuracoes
          </Button>
        }
      >
        {message}
      </Alert>
    </Box>
  );
};
