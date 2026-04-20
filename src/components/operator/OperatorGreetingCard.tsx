import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

type OperatorGreetingCardProps = {
  joinCode: string;
};

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  if (!navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export const OperatorGreetingCard = ({ joinCode }: OperatorGreetingCardProps): React.JSX.Element => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const normalizedCode = joinCode.trim();
  const greetingMessage = useMemo(
    () =>
      [
        "Ola! Tudo bem?",
        "Nosso condominio esta usando o Protocolo Encomendas para gerenciar entregas.",
        "Acesse o site: https://protocolocondo.com.br/",
        "Se voce ainda nao tem conta, faca seu cadastro. Se ja tiver, e so fazer login.",
        `Na solicitacao de acesso, use este codigo do condominio: ${normalizedCode}`,
      ].join("\n"),
    [normalizedCode],
  );

  const whatsappUrl = useMemo(
    () => `https://wa.me/?text=${encodeURIComponent(greetingMessage)}`,
    [greetingMessage],
  );

  const handleCopy = (): void => {
    void (async () => {
      const ok = await copyTextToClipboard(greetingMessage);
      if (ok) {
        setCopied(true);
        setCopyError(null);
        setTimeout(() => setCopied(false), 2200);
        return;
      }
      setCopyError("Nao foi possivel copiar a mensagem automaticamente.");
    })();
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" mb={1}>Convite para morador</Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Encaminhe a mensagem pronta para o morador com o link do site (https://protocolocondo.com.br/),
          orientacao de cadastro/login e uso do codigo do condominio.
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Codigo do condominio:</Typography>
          <Chip label={normalizedCode} color="primary" variant="outlined" />
        </Box>

        {copyError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCopyError(null)}>
            {copyError}
          </Alert>
        )}

        {copied && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Mensagem copiada.
          </Alert>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
            disabled={!normalizedCode}
            fullWidth
            sx={{
              justifyContent: "center",
              textAlign: "center",
              "& .MuiButton-startIcon": {
                marginLeft: 0,
                marginRight: 0,
              },
              gap: 1,
            }}
          >
            Copiar msg
          </Button>
          <Button
            component="a"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="success"
            startIcon={<WhatsAppIcon />}
            fullWidth
            sx={{
              justifyContent: "center",
              textAlign: "center",
              "& .MuiButton-startIcon": {
                marginLeft: 0,
                marginRight: 0,
              },
              gap: 1,
            }}
          >
            Compartilhar no WhatsApp
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
