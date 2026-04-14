import React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { useNavigate, useParams } from "react-router-dom";

import { api, resolveApiAssetUrl } from "@/services/api";
import { QRDisplay } from "@/components/QRDisplay";
import {
  type ClientPackage,
  normalizePickupTokenCode,
  normalizePickupTokenResponse,
  parseClientPackagesResponse,
} from "@/types/client.types";

export const PackageDetailScreen = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [pkg, setPkg] = useState<ClientPackage | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async (): Promise<void> => {
      try {
        const response = await api.get<ClientPackage[] | { packages: ClientPackage[] }>("/client/packages");
        const list = parseClientPackagesResponse(response.data);
        const found = list.find((p) => p.id === id);
        if (found) {
          setPkg(found);
          const code = normalizePickupTokenCode(found.pickupToken);
          if (code) setToken(code);
        }
      } catch {
        setError("Erro ao carregar pacote.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const handleGetToken = async (): Promise<void> => {
    if (!id) return;
    setTokenLoading(true);
    try {
      const response = await api.post<unknown>(`/client/packages/${id}/pickup-token`);
      const code = normalizePickupTokenResponse(response.data);
      if (code) setToken(code);
      else setError("Resposta inválida ao gerar token.");
    } catch {
      setError("Erro ao gerar token.");
    } finally {
      setTokenLoading(false);
    }
  };

  const handleAlert = async (): Promise<void> => {
    if (!id) return;
    setAlertLoading(true);
    try {
      await api.post(`/notifications/pickup-alert/${id}`);
      setAlertSent(true);
      setTimeout(() => setAlertSent(false), 5000);
    } catch {
      setError("Erro ao enviar alerta.");
    } finally {
      setAlertLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!pkg) {
    return (
      <Box sx={{ textAlign: "center", pt: 6 }}>
        <Typography>Pacote não encontrado.</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Voltar</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 480, mx: "auto" }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Voltar
      </Button>

      <Typography variant="h5" mb={0.5}>Detalhes do Pacote</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {pkg.condominium?.name ?? "Condomínio"}
        {pkg.unit
          ? ` — ${pkg.unit.block ? `Bloco ${pkg.unit.block} · ` : ""}Unidade ${pkg.unit.number}`
          : ""}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {alertSent && <Alert severity="success" sx={{ mb: 2 }}>Alerta enviado para a portaria!</Alert>}

      {resolveApiAssetUrl(pkg.photoUrl) && (
        <Box
          component="img"
          src={resolveApiAssetUrl(pkg.photoUrl)}
          alt="Foto do pacote"
          loading="lazy"
          decoding="async"
          sx={{ width: "100%", borderRadius: 2, mb: 2, maxHeight: 240, objectFit: "cover" }}
        />
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Chip
                label={pkg.status === "WAITING_PICKUP" ? "Aguardando Retirada" : "Entregue"}
                color={pkg.status === "WAITING_PICKUP" ? "warning" : "success"}
                size="small"
              />
            </Box>
            {pkg.carrier && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Portadora</Typography>
                <Typography variant="body2">{pkg.carrier}</Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Chegou em</Typography>
              <Typography variant="body2">{new Date(pkg.createdAt).toLocaleString("pt-BR")}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {pkg.status === "WAITING_PICKUP" && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={1}>Retirar Pacote</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Mostre este QR code ou token para o porteiro ao retirar seu pacote.
            </Typography>

            {token ? (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  <QRDisplay value={token} size={200} />
                </Box>
                <Box
                  sx={{
                    textAlign: "center",
                    fontFamily: "monospace",
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: 4,
                    color: "primary.main",
                    mb: 2,
                  }}
                >
                  {token}
                </Box>
              </Box>
            ) : (
              <Button
                variant="contained"
                fullWidth
                onClick={() => void handleGetToken()}
                disabled={tokenLoading}
                sx={{ mb: 2 }}
              >
                {tokenLoading ? <CircularProgress size={24} color="inherit" /> : "Gerar QR Code / Token"}
              </Button>
            )}

            <Divider sx={{ my: 2 }} />

            <Button
              variant="outlined"
              fullWidth
              startIcon={<NotificationsActiveIcon />}
              onClick={() => void handleAlert()}
              disabled={alertLoading}
            >
              {alertLoading ? "Enviando..." : "Alertar Portaria"}
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
