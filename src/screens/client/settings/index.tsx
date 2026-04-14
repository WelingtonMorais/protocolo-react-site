import React from "react";
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

import { useAuth } from "@/providers/AuthProvider";
import { useNotificationUI } from "@/providers/NotificationUIProvider";

export const ClientSettingsScreen = (): React.JSX.Element => {
  const { user, logout } = useAuth();
  const {
    pushSupported,
    pushPermission,
    pushEnabled,
    pushBusy,
    enablePush,
    disablePush,
  } = useNotificationUI();

  const pushStatusText = !pushSupported
    ? "Seu navegador nao oferece suporte a notificacoes."
    : pushPermission === "denied"
    ? "Notificacoes bloqueadas no navegador. Libere a permissao para ativar."
    : pushEnabled
    ? "Ativas e prontas para receber alertas em tempo real."
    : "Desativadas. Ative para receber avisos de encomendas e alertas.";

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
          <Alert severity={pushEnabled ? "success" : "warning"} sx={{ mb: 2 }}>
            {pushStatusText}
          </Alert>
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<NotificationsActiveIcon />}
              disabled={!pushSupported || pushBusy || pushEnabled}
              onClick={() => void enablePush()}
            >
              {pushBusy ? <CircularProgress size={18} color="inherit" /> : "Ativar"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<NotificationsOffIcon />}
              disabled={!pushSupported || pushBusy || !pushEnabled}
              onClick={() => void disablePush()}
            >
              Desativar
            </Button>
          </Stack>

          <Divider sx={{ mb: 2 }} />

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
