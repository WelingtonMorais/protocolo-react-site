import React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonIcon from "@mui/icons-material/Person";

import { api } from "@/services/api";
import type { AccessRequest } from "@/types/operator.types";

const statusColors: Record<AccessRequest["status"], "warning" | "success" | "error"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
};

const statusLabels: Record<AccessRequest["status"], string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

export const AccessRequestsScreen = (): React.JSX.Element => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const refetch = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<AccessRequest[]>("/employee/access-requests");
      setRequests(response.data);
    } catch {
      setError("Erro ao carregar pedidos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refetch();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject"): Promise<void> => {
    setActionLoading(id);
    try {
      await api.post(`/employee/access-requests/${id}/${action}`);
      await refetch();
    } catch {
      setError("Erro ao processar pedido.");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5">Pedidos de Acesso</Typography>
          <Typography variant="body2" color="text.secondary">
            {pendingRequests.length} pedido(s) pendente(s)
          </Typography>
        </Box>
        <Tooltip title="Atualizar">
          <IconButton onClick={() => void refetch()} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">Nenhum pedido de acesso encontrado.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {requests.map((req) => (
            <Card key={req.id} variant="outlined">
              <CardContent>
                {/* Header row: name + status chip */}
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "primary.light",
                        color: "primary.contrastText",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <PersonIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
                        {req.user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {req.user.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={statusLabels[req.status]}
                    color={statusColors[req.status]}
                    size="small"
                  />
                </Box>

                <Divider sx={{ my: 1 }} />

                {/* Details row */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: req.status === "PENDING" ? 2 : 0 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Unidade
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {req.unit
                        ? `${req.unit.block ? `Bloco ${req.unit.block} · ` : ""}Unidade ${req.unit.number}`
                        : "—"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Data
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                    </Typography>
                  </Box>
                </Box>

                {/* Actions */}
                {req.status === "PENDING" && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={
                        actionLoading === req.id ? (
                          <CircularProgress size={14} color="inherit" />
                        ) : (
                          <CheckIcon />
                        )
                      }
                      disabled={actionLoading === req.id}
                      onClick={() => void handleAction(req.id, "approve")}
                      sx={{ flex: 1 }}
                    >
                      Aprovar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CloseIcon />}
                      disabled={actionLoading === req.id}
                      onClick={() => void handleAction(req.id, "reject")}
                      sx={{ flex: 1 }}
                    >
                      Rejeitar
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {pendingRequests.length > 1 && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            color="success"
            onClick={() => {
              void Promise.all(pendingRequests.map((r) => handleAction(r.id, "approve")));
            }}
          >
            Aprovar todos pendentes ({pendingRequests.length})
          </Button>
        </Box>
      )}
    </Box>
  );
};
