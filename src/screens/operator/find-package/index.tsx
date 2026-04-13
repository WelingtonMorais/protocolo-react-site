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

import { api } from "@/services/api";
import { QRScanner } from "@/components/QRScanner";
import type { PickupFindResult } from "@/types/operator.types";

export const FindPackageScreen = (): React.JSX.Element => {
  const [token, setToken] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [result, setResult] = useState<PickupFindResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [delivered, setDelivered] = useState(false);

  const handleFind = async (tkn?: string): Promise<void> => {
    const searchToken = tkn ?? token;
    if (!searchToken.trim()) return;
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const response = await api.post<PickupFindResult>("/employee/pickup/find", {
        token: searchToken.trim(),
      });
      setResult(response.data);
      setToken(searchToken);
    } catch {
      setError("Token inválido ou pacote não encontrado.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = async (): Promise<void> => {
    if (!result) return;
    setDelivering(true);
    try {
      await api.post(`/employee/packages/${result.packageId}/deliver`);
      setDelivered(true);
    } catch {
      setError("Erro ao confirmar entrega. Tente novamente.");
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

  if (delivered) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}>
        <Card sx={{ maxWidth: 400, width: "100%" }}>
          <CardContent sx={{ textAlign: "center", p: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h6" fontWeight={700} mb={1}>Entregue com sucesso!</Typography>
            <Typography color="text.secondary" mb={3}>
              O pacote de <strong>{result?.recipientName}</strong> foi marcado como entregue.
            </Typography>
            <Button variant="contained" fullWidth onClick={handleReset}>
              Nova Entrega
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
            />
            <Button
              variant="contained"
              onClick={() => void handleFind()}
              disabled={loading || !token.trim()}
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

      {result && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>Pacote encontrado</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Destinatário</Typography>
                <Typography variant="body2" fontWeight={600}>{result.recipientName}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Unidade</Typography>
                <Typography variant="body2" fontWeight={600}>{result.unitNumber}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Token</Typography>
                <Chip label={result.token} size="small" />
              </Box>
            </Box>
            <Button
              variant="contained"
              color="success"
              fullWidth
              size="large"
              onClick={() => void handleDeliver()}
              disabled={delivering}
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
          void handleFind(data);
        }}
      />
    </Box>
  );
};
