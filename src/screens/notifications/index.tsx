import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useNotificationUI } from "@/providers/NotificationUIProvider";

export const NotificationsScreen = (): React.JSX.Element => {
  const {
    notifications,
    notificationsLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotificationUI();

  const hasNotifications = notifications.length > 0;
  const sorted = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notifications]
  );

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Typography variant="h5">Notificacoes</Typography>
        <Stack direction="row" spacing={1} justifyContent={{ xs: "space-between", sm: "flex-end" }}>
          <Tooltip title="Atualizar lista">
            <IconButton
              aria-label="Atualizar notificacoes"
              onClick={() => void refreshNotifications()}
              size="small"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            onClick={() => void markAllAsRead()}
            disabled={unreadCount === 0}
            size="small"
          >
            Marcar todas como lidas
          </Button>
        </Stack>
      </Box>

      {notificationsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !hasNotifications ? (
        <Alert severity="info">Nenhuma notificacao encontrada.</Alert>
      ) : (
        <Stack spacing={1.5}>
          {sorted.map((item) => {
            const isRead = item.status === "READ";
            return (
              <Card key={item.id} variant="outlined">
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      justifyContent: "space-between",
                      alignItems: { xs: "stretch", sm: "flex-start" },
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {item.body}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: "block" }}>
                        {new Date(item.createdAt).toLocaleString("pt-BR")}
                      </Typography>
                    </Box>
                    <Stack spacing={1} alignItems={{ xs: "flex-start", sm: "flex-end" }}>
                      <Chip
                        size="small"
                        color={isRead ? "default" : "success"}
                        label={isRead ? "Lida" : "Nova"}
                      />
                      {!isRead && (
                        <Button size="small" onClick={() => void markAsRead(item.id)}>
                          Marcar como lida
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};
