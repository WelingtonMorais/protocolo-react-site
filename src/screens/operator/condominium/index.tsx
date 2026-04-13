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
  Divider,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ApartmentIcon from "@mui/icons-material/Apartment";

import { api } from "@/services/api";
import { QRDisplay } from "@/components/QRDisplay";
import type { Condominium } from "@/types/operator.types";

/** API Prisma usa `joinCode`; a UI usa `code` para o convite. */
type CondoApiPayload = {
  id: string;
  name: string;
  joinCode?: string;
  code?: string;
  address?: string | null;
};

function mapCondoFromApi(data: CondoApiPayload | null | undefined): Condominium | null {
  if (!data?.id) return null;
  const code = (data.joinCode ?? data.code ?? "").trim();
  return {
    id: data.id,
    name: data.name,
    code,
    address: data.address ?? undefined,
  };
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* tenta fallback */
    }
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

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
        const response = await api.get<CondoApiPayload | null>("/employee/condominiums/me");
        setCondominium(mapCondoFromApi(response.data));
      } catch {
        setCondominium(null);
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
      const response = await api.post<CondoApiPayload>("/employee/condominiums", {
        name,
        address: address || undefined,
      });
      setCondominium(mapCondoFromApi(response.data));
      setSuccess("Condomínio criado com sucesso!");
    } catch {
      setError("Erro ao criar condomínio.");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (): void => {
    const text = condominium?.code;
    if (!text) {
      setError("Código de convite indisponível. Atualize a página.");
      return;
    }
    void (async () => {
      const ok = await copyTextToClipboard(text);
      if (ok) {
        setCopied(true);
        setError(null);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setError("Não foi possível copiar automaticamente. Selecione o código no campo acima e use Ctrl+C.");
      }
    })();
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
              Os moradores usam este código no aplicativo para pedir vínculo ao condomínio. Envie por mensagem
              ou peça para escanear o QR Code abaixo (mesmo código).
            </Typography>

            <TextField
              fullWidth
              label="Código para colar ou ler"
              value={condominium.code}
              onClick={(e) => (e.target as HTMLInputElement).select?.()}
              InputProps={{
                readOnly: true,
                sx: {
                  fontFamily: "monospace",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={copied ? "Copiado!" : "Copiar código"}>
                      <span>
                        <IconButton
                          edge="end"
                          onClick={handleCopy}
                          disabled={!condominium.code}
                          aria-label="Copiar código de convite"
                          color={copied ? "success" : "default"}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
              Dica: toque no campo para selecionar tudo, ou use o ícone de copiar à direita.
            </Typography>

            <Typography variant="subtitle2" mb={1}>QR Code</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Quadrado em branco com padrão preto: é o QR com o mesmo código, para o morador escanear no celular
              (se o app oferecer leitura por câmera).
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              {condominium.code ? (
                <QRDisplay value={condominium.code} size={200} />
              ) : (
                <Typography color="text.secondary">Código não disponível para gerar QR.</Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
