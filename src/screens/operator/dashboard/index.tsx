import React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import AddBoxIcon from "@mui/icons-material/AddBox";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";

import { dashboardService } from "./services/dashboard.service";
import type { Package } from "@/types/operator.types";
import { useAuth } from "@/providers/AuthProvider";
import { StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";

const statusLabel: Record<Package["status"], string> = {
  WAITING_PICKUP: "Aguardando Retirada",
  DELIVERED: "Entregue",
};

export const OperatorDashboard = (): React.JSX.Element => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [packages, setPackages] = useState<Package[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getPackages();
      setPackages(data.packages);
      setPendingCount(data.pendingCount);
      setDeliveredCount(data.deliveredCount);
    } catch {
      setError("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refetch();
  }, []);

  const recentPending = packages.filter((p) => p.status === "WAITING_PICKUP").slice(0, 10);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5">Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Olá, {user?.name}! Aqui está o resumo das encomendas.
          </Typography>
        </Box>
        <Tooltip title="Atualizar">
          <IconButton onClick={() => void refetch()} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <StaggerContainer>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { icon: <Inventory2Icon />, value: packages.length, label: "Total de Pacotes", color: "primary.main" },
            { icon: <PendingIcon />, value: pendingCount, label: "Aguardando Retirada", color: "warning.main" },
            { icon: <CheckCircleIcon />, value: deliveredCount, label: "Entregues", color: "success.main" },
          ].map((stat) => (
            <Grid item xs={12} sm={4} key={stat.label}>
              <StaggerItem>
                <Card sx={{ overflow: "visible" }}>
                  <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        bgcolor: stat.color,
                        borderRadius: 2,
                        p: 1.5,
                        color: "white",
                        boxShadow: `0 4px 12px rgba(0,0,0,0.15)`,
                        flexShrink: 0,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: "-0.03em" }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </StaggerItem>
            </Grid>
          ))}
        </Grid>
      </StaggerContainer>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddBoxIcon />}
          onClick={() => navigate("/operador/registrar")}
        >
          Registrar Pacote
        </Button>
        <Button
          variant="outlined"
          startIcon={<QrCodeScannerIcon />}
          onClick={() => navigate("/operador/entregar")}
        >
          Entregar Pacote
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>Pendentes Recentes</Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : recentPending.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={3}>
              Nenhum pacote aguardando retirada.
            </Typography>
          ) : (
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Destinatário</TableCell>
                    <TableCell>Unidade</TableCell>
                    <TableCell>Portadora</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Data</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentPending.map((pkg) => (
                    <TableRow key={pkg.id} hover>
                      <TableCell>{pkg.recipientName ?? "—"}</TableCell>
                      <TableCell>
                        {pkg.unit
                          ? `${pkg.unit.block ? `Bloco ${pkg.unit.block} · ` : ""}Unidade ${pkg.unit.number}`
                          : "—"}
                      </TableCell>
                      <TableCell>{pkg.carrier ?? "—"}</TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabel[pkg.status]}
                          size="small"
                          color={pkg.status === "WAITING_PICKUP" ? "warning" : "success"}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(pkg.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
