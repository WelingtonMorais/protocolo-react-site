import React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ApartmentIcon from "@mui/icons-material/Apartment";

import { api } from "@/services/api";
import { QRDisplay } from "@/components/QRDisplay";
import type { Condominium } from "@/types/operator.types";

export const CondominiumScreen = (): React.JSX.Element => {
  const [condominium, setCondominium] = useState<Condominium | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const response = await api.get<Condominium>("/employee/condominiums");
        setCondominium(response.data);
      } catch {
        // No condominium yet
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleCreate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const response = await api.post<Condominium>("/employee/condominiums", { name, address: address || undefined });
      setCondominium(response.data);
      setSuccess("Condomínio criado com sucesso!");
    } catch {
      setError("Erro ao criar condomínio.");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (): void => {
    if (condominium?.code) {
      void navigator.clipboard.writeText(condominium.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      <Typography variant="h5" mb={0.5}>Condomínio</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Configure e compartilhe o código de acesso com os moradores.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {!condominium ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <ApartmentIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
              <Typography variant="h6">Criar Condomínio</Typography>
              <Typography variant="body2" color="text.secondary">
                Configure o condomínio para começar a usar o sistema.
              </Typography>
            </Box>
            <Box component="form" onSubmit={handleCreate} noValidate>
              <TextField
                label="Nome do condomínio"
                fullWidth
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Endereço (opcional)"
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={creating || !name}
              >
                {creating ? "Criando..." : "Criar Condomínio"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <ApartmentIcon sx={{ fontSize: 40, color: "primary.main" }} />
              <Box>
                <Typography variant="h6">{condominium.name}</Typography>
                {condominium.address && (
                  <Typography variant="body2" color="text.secondary">
                    {condominium.address}
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" mb={1}>Código de convite</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Compartilhe este código com os moradores para que possam se vincular ao condomínio.
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <Chip
                label={condominium.code}
                size="medium"
                sx={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopy}
              >
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </Box>

            <Typography variant="subtitle2" mb={2}>QR Code para moradores</Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <QRDisplay value={condominium.code} size={200} />
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
