import React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";

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

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : requests.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={3}>
              Nenhum pedido de acesso encontrado.
            </Typography>
          ) : (
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Morador</TableCell>
                    <TableCell>E-mail</TableCell>
                    <TableCell>Unidade</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id} hover>
                      <TableCell>{req.user.name}</TableCell>
                      <TableCell>{req.user.email}</TableCell>
                      <TableCell>
                        {req.unit
                          ? `${req.unit.block ? req.unit.block + " / " : ""}${req.unit.number}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabels[req.status]}
                          color={statusColors[req.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell align="center">
                        {req.status === "PENDING" && (
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                            <Tooltip title="Aprovar">
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => void handleAction(req.id, "approve")}
                                disabled={actionLoading === req.id}
                              >
                                {actionLoading === req.id ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <CheckIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Rejeitar">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => void handleAction(req.id, "reject")}
                                disabled={actionLoading === req.id}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Quick approve all */}
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
