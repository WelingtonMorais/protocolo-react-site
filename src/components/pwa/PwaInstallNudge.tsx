import React from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";

import { usePwaInstallNudge } from "@/hooks/usePwaInstallNudge";

/**
 * Convite a instalar o Protocolo como PWA (atalho na tela inicial).
 * Chrome/Edge: usa beforeinstallprompt. iOS Safari: instruções manuais.
 */
export const PwaInstallNudge = (): React.JSX.Element | null => {
  const { visible, canUseNativePrompt, busy, promptInstall, dismiss } = usePwaInstallNudge();

  if (!visible) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity="info"
        icon={<GetAppIcon fontSize="inherit" />}
        action={
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1, alignItems: "stretch" }}>
            {canUseNativePrompt && (
              <Button
                color="inherit"
                size="small"
                variant="outlined"
                disabled={busy}
                onClick={() => void promptInstall()}
              >
                {busy ? "A abrir…" : "Instalar app"}
              </Button>
            )}
            <Button color="inherit" size="small" onClick={dismiss}>
              Agora não
            </Button>
          </Box>
        }
      >
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          {canUseNativePrompt ? "Instale o Protocolo como aplicativo" : "Adicione o Protocolo à sua tela inicial"}
        </Typography>
        {canUseNativePrompt ? (
          <Typography variant="body2" color="text.secondary">
            Abre mais rápido, fica com ícone na tela e melhora notificações no telemóvel. Toque em &quot;Instalar app&quot;
            para confirmar.
          </Typography>
        ) : (
          <Box component="ol" sx={{ m: 0, pl: 2.5, "& li": { typography: "body2", color: "text.secondary" } }}>
            <li>
              Toque no botão <strong>Partilhar</strong> na barra do Safari (quadrado com seta para cima).
            </li>
            <li>
              Escolha <strong>Adicionar à ecrã principal</strong> ou <strong>Adicionar à tela inicial</strong>.
            </li>
            <li>
              Confirme. Depois abra o Protocolo pelo <strong>ícone novo</strong> — assim as notificações push funcionam
              melhor.
            </li>
          </Box>
        )}
      </Alert>
    </Box>
  );
};
