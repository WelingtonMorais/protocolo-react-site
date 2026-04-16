import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import ApartmentIcon from "@mui/icons-material/Apartment";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

import { useAuth } from "@/providers/AuthProvider";
import { useNotificationUI } from "@/providers/NotificationUIProvider";
import { humanMessageForBlockReason } from "@/utils/web-push-env";

export const ClientSettingsScreen = (): React.JSX.Element => {
  const { user, logout } = useAuth();
  const {
    pushSupported,
    pushPermission,
    pushEnabled,
    pushBusy,
    enablePush,
    disablePush,
    pushStaticBlockReason,
  } = useNotificationUI();

  const [pushActionError, setPushActionError] = useState<string | null>(null);

  const pushStatusText = !pushSupported
    ? pushStaticBlockReason
      ? humanMessageForBlockReason(pushStaticBlockReason)
      : "Este ambiente ainda nao esta pronto para notificacoes push. Recarregue a pagina ou use HTTPS."
    : pushPermission === "denied"
    ? "Notificacoes bloqueadas no navegador. Libere a permissao para ativar."
    : pushEnabled
    ? "Ativas e prontas para receber alertas em tempo real."
    : "Desativadas. Ative para receber avisos de encomendas e alertas.";

  const pushMainAlertSeverity =
    pushEnabled ? "success"
    : !pushSupported && pushStaticBlockReason === "ios_needs_pwa" ? "info"
    : "warning";

  return (
    <Box sx={{ maxWidth: 480, mx: "auto" }}>
      <Typography variant="h5" mb={3}>Configurações</Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main", fontSize: 24 }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6">{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role === "CLIENT" ? "Morador" : "Operador"}
              </Typography>
            </Box>
          </Box>

          <Divider />

          <List dense>
            <ListItem>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Nome" secondary={user?.name} />
            </ListItem>
            <ListItem>
              <ListItemIcon><EmailIcon /></ListItemIcon>
              <ListItemText primary="E-mail" secondary={user?.email} />
            </ListItem>
            {user?.condominiumId && (
              <ListItem>
                <ListItemIcon><ApartmentIcon /></ListItemIcon>
                <ListItemText primary="ID do Condomínio" secondary={user.condominiumId} />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" mb={1}>Notificacoes push</Typography>
          {pushActionError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPushActionError(null)}>
              {pushActionError}
            </Alert>
          )}
          <Alert severity={pushMainAlertSeverity} sx={{ mb: 2 }}>
            {pushStatusText}
          </Alert>
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<NotificationsActiveIcon />}
              disabled={!pushSupported || pushBusy || pushEnabled}
              onClick={() => {
                setPushActionError(null);
                void (async () => {
                  try {
                    await enablePush();
                  } catch (e) {
                    setPushActionError(e instanceof Error ? e.message : "Erro ao ativar notificacoes.");
                  }
                })();
              }}
            >
              {pushBusy ? <CircularProgress size={18} color="inherit" /> : "Ativar"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<NotificationsOffIcon />}
              disabled={!pushSupported || pushBusy || !pushEnabled}
              onClick={() => {
                setPushActionError(null);
                void (async () => {
                  try {
                    await disablePush();
                  } catch (e) {
                    setPushActionError(e instanceof Error ? e.message : "Erro ao desativar notificacoes.");
                  }
                })();
              }}
            >
              Desativar
            </Button>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {user?.role !== "CLIENT" && (
            <>
              <Typography variant="h6" mb={1}>Suporte</Typography>
              <Alert severity="info" icon={<SupportAgentIcon />} sx={{ mb: 2 }}>
                Para importacao rapida de unidades em lote, fale com nosso suporte no WhatsApp.
              </Alert>
              <Button
                component="a"
                href="https://wa.me/5519993148395"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              >
                Chamar suporte: +55 19 99314-8395
              </Button>
              <Divider sx={{ mb: 2 }} />
            </>
          )}

          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={logout}
            size="large"
          >
            Sair da conta
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
