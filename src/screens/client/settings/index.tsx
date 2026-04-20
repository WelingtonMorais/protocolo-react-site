import React, { useEffect, useState } from "react";
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
  Chip,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import ApartmentIcon from "@mui/icons-material/Apartment";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import GetAppIcon from "@mui/icons-material/GetApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { useAuth } from "@/providers/AuthProvider";
import { whatsAppMeUrl } from "@/lib/whatsapp-support";
import { useNotificationUI } from "@/providers/NotificationUIProvider";
import { humanMessageForBlockReason, isRunningAsInstalledPwa } from "@/utils/web-push-env";
import { usePwaInstallNudge } from "@/hooks/usePwaInstallNudge";
import { api } from "@/services/api";
import { OperatorGreetingCard } from "@/components/operator/OperatorGreetingCard";

type CondoApiPayload = {
  id: string;
  joinCode?: string;
  code?: string;
};

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

  const { canUseNativePrompt, isAndroidManual, busy: pwaBusy, promptInstall } = usePwaInstallNudge();
  const isPwaInstalled = isRunningAsInstalledPwa();

  const [pushActionError, setPushActionError] = useState<string | null>(null);
  const [operatorJoinCode, setOperatorJoinCode] = useState<string>("");

  useEffect(() => {
    if (user?.role !== "EMPLOYEE") return;

    const loadCondominium = async (): Promise<void> => {
      try {
        const response = await api.get<CondoApiPayload | null>("/employee/condominiums/me");
        const joinCode = (response.data?.joinCode ?? response.data?.code ?? "").trim();
        setOperatorJoinCode(joinCode);
      } catch {
        setOperatorJoinCode("");
      }
    };

    void loadCondominium();
  }, [user?.role, user?.condominiumId]);

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

      {user?.role === "EMPLOYEE" && operatorJoinCode && (
        <OperatorGreetingCard joinCode={operatorJoinCode} />
      )}

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

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="h6">Instalar aplicativo</Typography>
            {isPwaInstalled && (
              <Chip icon={<CheckCircleIcon />} label="Instalado" color="success" size="small" />
            )}
          </Box>

          {isPwaInstalled ? (
            <Alert severity="success" sx={{ mb: 1 }}>
              O Protocolo está instalado como app neste dispositivo.
            </Alert>
          ) : canUseNativePrompt ? (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Instale o Protocolo na tela inicial para acesso mais rápido e melhores notificações.
              </Alert>
              <Button
                variant="contained"
                startIcon={pwaBusy ? <CircularProgress size={18} color="inherit" /> : <GetAppIcon />}
                disabled={pwaBusy}
                onClick={() => void promptInstall()}
                fullWidth
              >
                {pwaBusy ? "Abrindo…" : "Instalar app"}
              </Button>
            </>
          ) : isAndroidManual ? (
            <>
              <Alert severity="info" sx={{ mb: 1 }}>
                Para instalar o Protocolo no Android:
              </Alert>
              <Box component="ol" sx={{ m: 0, pl: 2.5, "& li": { typography: "body2", color: "text.secondary", mb: 0.5 } }}>
                <li>Toque no menu <strong>⋮</strong> (três pontos) no canto superior direito do Chrome.</li>
                <li>Escolha <strong>Adicionar à tela inicial</strong>.</li>
                <li>Confirme e abra pelo <strong>ícone novo</strong>.</li>
              </Box>
            </>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 1 }}>
                Para instalar no iPhone/iPad:
              </Alert>
              <Box component="ol" sx={{ m: 0, pl: 2.5, "& li": { typography: "body2", color: "text.secondary", mb: 0.5 } }}>
                <li>Toque em <strong>Partilhar</strong> na barra do Safari (quadrado com seta para cima).</li>
                <li>Escolha <strong>Adicionar à tela inicial</strong>.</li>
                <li>Confirme e abra pelo <strong>ícone novo</strong>.</li>
              </Box>
            </>
          )}
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
                href={whatsAppMeUrl()}
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
