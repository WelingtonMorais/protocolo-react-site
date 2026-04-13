import React from "react";
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";

import { api } from "@/services/api";
import { QRScanner } from "@/components/QRScanner";
import type { EmployeePickupFindResponse } from "@/types/operator.types";

function normalizePickupInput(raw: string): string {
  const t = raw.trim();
  if (t.toLowerCase().startsWith("pickup:")) {
    return t.slice(7).trim();
  }
  return t;
}

function formatUnitLine(unit: { number: string; block?: string | null }): string {
  const b = unit.block?.trim();
  if (!b || b === "-") return `Ap. ${unit.number}`;
  return `Bloco ${b} · Ap. ${unit.number}`;
}

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (typeof data?.message === "string" && data.message.length > 0) {
      return data.message;
    }
  }
  return fallback;
}

export const FindPackageScreen = (): React.JSX.Element => {
  const [token, setToken] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [result, setResult] = useState<EmployeePickupFindResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [delivered, setDelivered] = useState(false);

  const handleFind = async (tkn?: string): Promise<void> => {
    const searchToken = normalizePickupInput(tkn ?? token);
    if (!searchToken) return;
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const response = await api.post<EmployeePickupFindResponse>("/employee/pickup/find", {
        token: searchToken,
      });
      const data = response.data;
      if (!data?.pkg) {
        setError("Resposta inválida da API.");
        return;
      }
      setResult(data);
      setToken(data.code);
    } catch (err) {
      setError(apiErrorMessage(err, "Token inválido ou pacote não encontrado."));
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = async (): Promise<void> => {
    if (!result?.pkg || !result.code) return;
    setDelivering(true);
    setError(null);
    try {
      await api.post(`/employee/packages/${result.pkg.id}/deliver`, {
        token: result.code,
      });
      setDelivered(true);
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao confirmar entrega. Tente novamente."));
    } finally {
      setDelivering(false);
    }
  };

  const handleReset = (): void => {
    setToken("");
    setResult(null);
    setDelivered(false);
    setError(null);
  };

  const recipientLabel =
    result?.pkg?.receiver?.name ?? result?.pkg?.description ?? "—";

  if (delivered) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}>
        <Card sx={{ maxWidth: 400, width: "100%" }}>
          <CardContent sx={{ textAlign: "center", p: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h6" fontWeight={700} mb={1}>Entregue com sucesso!</Typography>
            <Typography color="text.secondary" mb={3}>
              O pacote de <strong>{recipientLabel}</strong> foi marcado como entregue.
            </Typography>
            <Button variant="contained" fullWidth onClick={handleReset}>
              Nova Entrega
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const pkg = result?.pkg;

  return (
    <Box sx={{ maxWidth: 520, mx: "auto" }}>
      <Typography variant="h5" mb={0.5}>Entregar Pacote</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Escaneie o QR code do morador ou digite o token de retirada.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              label="Token de retirada"
              fullWidth
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleFind(); }}
              placeholder="Digite o token..."
              inputProps={{ autoComplete: "off" }}
            />
            <Button
              variant="contained"
              onClick={() => void handleFind()}
              disabled={loading || !normalizePickupInput(token)}
              sx={{ minWidth: 80 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Buscar"}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">ou</Typography>
          </Divider>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<QrCodeScannerIcon />}
            onClick={() => setScannerOpen(true)}
          >
            Escanear QR Code
          </Button>
        </CardContent>
      </Card>

      {pkg && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>Pacote encontrado</Typography>
            {pkg.photoUrl && (
              <Box
                component="img"
                src={pkg.photoUrl}
                alt="Foto do pacote"
                sx={{ width: "100%", borderRadius: 2, mb: 2, maxHeight: 200, objectFit: "cover" }}
              />
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Typography variant="body2" color="text.secondary">Descrição</Typography>
                <Typography variant="body2" fontWeight={600} textAlign="right">{pkg.description}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Condomínio</Typography>
                <Typography variant="body2" fontWeight={600}>{pkg.condominium.name}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Unidade</Typography>
                <Typography variant="body2" fontWeight={600}>{formatUnitLine(pkg.unit)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Destinatário</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {pkg.receiver?.name ?? "—"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">Token</Typography>
                <Chip label={result?.code ?? "—"} size="small" sx={{ fontFamily: "monospace", fontWeight: 700 }} />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Recebida em</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {new Date(pkg.createdAt).toLocaleString("pt-BR")}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              color="success"
              fullWidth
              size="large"
              onClick={() => void handleDeliver()}
              disabled={delivering || pkg.status !== "WAITING_PICKUP"}
            >
              {delivering ? <CircularProgress size={24} color="inherit" /> : "Confirmar Entrega"}
            </Button>
          </CardContent>
        </Card>
      )}

      <QRScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(data) => {
          setScannerOpen(false);
          const normalized = normalizePickupInput(data);
          setToken(normalized);
          void handleFind(normalized);
        }}
      />
    </Box>
  );
};
