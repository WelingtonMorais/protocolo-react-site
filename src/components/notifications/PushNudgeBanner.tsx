import React from "react";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
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
    enablePush,
    pushBusy,
  } = useNotificationUI();

  if (!user) return null;

  const settingsPath = user.role === "CLIENT" ? "/morador/configuracoes" : "/operador/configuracoes";

  if (needsIosPwaInstallHint) {
    return (
      <Box sx={{ mb: 2 }}>
        <Alert
          severity="info"
          icon={<NotificationsActiveIcon fontSize="inherit" />}
          action={
            <Button color="inherit" size="small" onClick={() => navigate(settingsPath)}>
              Detalhes
            </Button>
          }
          sx={{ alignItems: "flex-start", "& .MuiAlert-action": { pt: { xs: 0.5, sm: 0 }, mr: 0 } }}
        >
          {humanMessageForBlockReason("ios_needs_pwa")}
        </Alert>
      </Box>
    );
  }

  if (!pushSupported || !needsPushNudge) return null;

  const isDenied = pushPermission === "denied";

  const message = isDenied
    ? "Notificações bloqueadas no navegador. Ative para receber avisos em tempo real."
    : "Ative as notificações para não perder avisos de encomendas e atualizações importantes.";

  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity="warning"
        icon={<NotificationsActiveIcon fontSize="inherit" />}
        action={
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              alignItems: { xs: "stretch", sm: "center" },
              minWidth: { xs: 110, sm: "auto" },
            }}
          >
            {isDenied ? (
              <Button color="inherit" size="small" onClick={() => navigate(settingsPath)}>
                Configurações
              </Button>
            ) : (
              <Button
                color="inherit"
                size="small"
                variant="outlined"
                disabled={pushBusy}
                startIcon={
                  pushBusy ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <NotificationsActiveIcon fontSize="small" />
                  )
                }
                onClick={() => void enablePush()}
              >
                {pushBusy ? "Ativando…" : "Ativar"}
              </Button>
            )}
          </Box>
        }
        sx={{
          alignItems: "flex-start",
          "& .MuiAlert-action": {
            pt: { xs: 0.5, sm: 0 },
            pl: { xs: 0, sm: 2 },
            mr: 0,
          },
        }}
      >
        {message}
      </Alert>
    </Box>
  );
};
