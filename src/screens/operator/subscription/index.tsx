import React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Button,
  Grid,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useNavigate } from "react-router-dom";

import { api } from "@/services/api";
import type { Subscription } from "@/types/operator.types";

export const SubscriptionScreen = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [noCondo, setNoCondo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        setNoCondo(false);
        const response = await api.get<Subscription | null>("/employee/subscriptions/current");
        if (response.data === null || response.data === undefined) {
          setSubscription(null);
          setNoCondo(true);
        } else {
          setSubscription(response.data);
        }
      } catch {
        setError("Erro ao carregar dados do plano.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const usagePercent =
    subscription && subscription.packageLimit > 0
      ? Math.min((subscription.packageCount / subscription.packageLimit) * 100, 100)
      : 0;

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      <Typography variant="h5" mb={0.5}>Plano & Assinatura</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Gerencie sua assinatura do Protocolo Encomendas.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {noCondo && !error && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate("/operador/condominio")}>
              Meu condomínio
            </Button>
          }
        >
          Crie seu condomínio para ver o plano, limites e uso de encomendas.
        </Alert>
      )}

      {subscription && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CreditCardIcon color="primary" />
                    <Typography variant="h6">{subscription.planName}</Typography>
                  </Box>
                  <Chip
                    label={subscription.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    color={subscription.status === "ACTIVE" ? "success" : "error"}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Válido até: {new Date(subscription.expiresAt).toLocaleDateString("pt-BR")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <TrendingUpIcon color="primary" />
                  <Typography variant="subtitle1">Uso do mês</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Pacotes registrados</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {subscription.packageCount} /{" "}
                    {subscription.packageLimit >= 999_000 ? "ilimitado" : subscription.packageLimit}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={usagePercent}
                  color={usagePercent > 90 ? "error" : usagePercent > 70 ? "warning" : "primary"}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                  {Math.round(usagePercent)}% utilizado
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {subscription.status !== "ACTIVE" && (
            <Grid item xs={12}>
              <Card sx={{ border: "2px solid", borderColor: "primary.main" }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h6" mb={1}>Renovar Assinatura</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Renove seu plano para continuar usando o sistema.
                  </Typography>
                  <Button variant="contained" size="large" fullWidth>
                    Ver Planos Disponíveis
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};
