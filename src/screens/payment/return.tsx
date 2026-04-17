import React, { useMemo } from "react";
import { Box, Button, Card, CardContent, Typography, Stack } from "@mui/material";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { trackEvent, trackGoogleAdsConversion } from "@/lib/analytics";

type PaymentReturnKind = "success" | "failure" | "pending";

const ADS_PAYMENT_CONV_SESSION_KEY = "protocolo_gads_conv_payment_return";

function parseKind(pathname: string): PaymentReturnKind {
  if (pathname.includes("/payment/failure")) return "failure";
  if (pathname.includes("/payment/pending")) return "pending";
  return "success";
}

export const PaymentReturnScreen = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const kind = useMemo(() => parseKind(pathname), [pathname]);
  React.useEffect(() => {
    if (kind === "success") {
      trackEvent("payment_success", { page: "payment_return" });
      if (!sessionStorage.getItem(ADS_PAYMENT_CONV_SESSION_KEY)) {
        sessionStorage.setItem(ADS_PAYMENT_CONV_SESSION_KEY, "1");
        trackGoogleAdsConversion({ value: 1.0, currency: "BRL" });
      }
    }
  }, [kind]);

  const hasSession = typeof window !== "undefined" && Boolean(localStorage.getItem("token"));

  const goToApp = (): void => {
    if (hasSession) {
      navigate("/operador/planos", { replace: true });
      return;
    }
    navigate("/login", { replace: true });
  };

  const copy =
    kind === "success"
      ? {
          title: "Pagamento concluído",
          body: "Obrigado! Quando o Mercado Pago confirmar, seu plano atualiza automaticamente. Use o botão abaixo para voltar ao Protocolo.",
          Icon: CheckCircleOutlineIcon,
          color: "success.main" as const,
        }
      : kind === "failure"
        ? {
            title: "Pagamento não concluído",
            body: "Não foi possível concluir o pagamento. Você pode tentar novamente pelos planos na sua conta.",
            Icon: ErrorOutlineIcon,
            color: "error.main" as const,
          }
        : {
            title: "Pagamento pendente",
            body: "Seu pagamento está em análise. Assim que for confirmado, a assinatura será atualizada. Volte ao sistema e use Atualizar status na tela de planos.",
            Icon: HourglassEmptyIcon,
            color: "warning.main" as const,
          };

  const Icon = copy.Icon;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Card sx={{ maxWidth: 440, width: "100%" }}>
        <CardContent sx={{ textAlign: "center", py: 4, px: 3 }}>
          <Icon sx={{ fontSize: 64, color: copy.color, mb: 2 }} />
          <Typography variant="h5" fontWeight={700} mb={1}>
            {copy.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {copy.body}
          </Typography>
          <Stack spacing={1.5}>
            <Button variant="contained" size="large" fullWidth onClick={goToApp}>
              Voltar ao sistema
            </Button>
            <Button component={RouterLink} to="/" variant="text" size="small" color="inherit">
              Ir para página inicial
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
