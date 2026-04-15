import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { api } from "@/services/api";
import type { PendingPayment, PlanOffer, Subscription } from "@/types/operator.types";

type CheckoutPreference = {
  preferenceId: string;
  initPoint: string;
};

function apiMessage(err: unknown, fallback: string): string {
  if (!axios.isAxiosError(err)) return fallback;
  const payload = err.response?.data as { message?: string } | undefined;
  return typeof payload?.message === "string" ? payload.message : fallback;
}

export const PlanCatalogScreen = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PlanOffer[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingPlan, setPayingPlan] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [plansRes, currentRes, pendingRes] = await Promise.all([
        api.get<PlanOffer[]>("/plans"),
        api.get<Subscription | null>("/employee/subscriptions/current"),
        api.get<PendingPayment | null>("/employee/payments/pending"),
      ]);
      setPlans(plansRes.data ?? []);
      setSubscription(currentRes.data ?? null);
      setPendingPayment(pendingRes.data ?? null);
    } catch (err) {
      setError(apiMessage(err, "Nao foi possivel carregar os planos."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const subtitle = useMemo(() => {
    if (!subscription) return "Escolha um plano para ativar e continuar sem interrupcoes.";
    if (subscription.status === "EXPIRED") {
      return "Seu plano venceu. Assine agora para voltar a registrar encomendas sem bloqueios.";
    }
    if (subscription.status === "INACTIVE") {
      return "Sua assinatura esta inativa. Ative um plano para liberar o fluxo completo.";
    }
    return "Faca upgrade quando quiser mais capacidade e recursos para o condominio.";
  }, [subscription]);

  const handleCheckout = async (planType: string): Promise<void> => {
    setPayingPlan(planType);
    setError(null);
    setSuccess(null);
    try {
      const { data } = await api.post<CheckoutPreference>("/employee/payments/create-preference", {
        planType,
      });
      if (!data?.initPoint) {
        throw new Error("Link de pagamento indisponivel.");
      }
      setSuccess("Checkout aberto em nova aba. Conclua o pagamento e depois toque em Atualizar status.");
      window.open(data.initPoint, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(apiMessage(err, "Nao foi possivel iniciar o checkout do plano."));
    } finally {
      setPayingPlan(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 920, mx: "auto" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} mb={2}>
        <Box>
          <Typography variant="h5">Planos disponiveis</Typography>
          <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate("/operador/plano")}>
            Voltar para assinatura
          </Button>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={() => void load()} disabled={loading}>
            Atualizar status
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      <Alert severity="info" sx={{ mb: 2 }}>
        No app do banco ou fatura do cartão, a cobrança pode aparecer em nome de{" "}
        <strong>Welington Morais</strong> (titular / pessoa física responsável pelo recebimento). Isso é esperado e
        corresponde à assinatura do Protocolo.
      </Alert>

      {pendingPayment?.status === "PENDING" && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Pagamento pendente para o plano <strong>{pendingPayment.planType}</strong>. Assim que aprovado, a assinatura atualiza automaticamente.
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {plans.map((plan) => {
            const isCurrent = subscription?.planName.toLowerCase() === plan.name.toLowerCase();
            return (
              <Grid item xs={12} md={4} key={plan.type}>
                <Card sx={{ height: "100%" }}>
                  <CardContent sx={{ display: "grid", gap: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{plan.name}</Typography>
                      {isCurrent && <Chip size="small" color="success" label="Plano atual" />}
                    </Stack>
                    <Typography variant="h4" fontWeight={800}>
                      R$ {plan.price.toFixed(2).replace(".", ",")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {plan.monthlyLimit == null ? "Encomendas ilimitadas por mes" : `${plan.monthlyLimit} encomendas por mes`}
                    </Typography>
                    <Divider />
                    <Stack spacing={1}>
                      {plan.features.map((feature) => (
                        <Stack direction="row" spacing={1} alignItems="center" key={feature}>
                          <CheckCircleIcon color="success" fontSize="small" />
                          <Typography variant="body2">{feature}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                    <Button
                      sx={{ mt: 1 }}
                      fullWidth
                      size="large"
                      variant={isCurrent ? "outlined" : "contained"}
                      startIcon={<OpenInNewIcon />}
                      onClick={() => void handleCheckout(plan.type)}
                      disabled={payingPlan !== null || isCurrent}
                    >
                      {isCurrent ? "Plano atual" : payingPlan === plan.type ? "Abrindo checkout..." : "Assinar / Upgrade"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};
